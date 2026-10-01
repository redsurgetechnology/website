---
title: "Nginx RTMP Low Latency: Configuration Guide for Sub-Second Streaming"
date: "2026-10-01T10:00:00.000Z"
excerpt: "Reduce Nginx RTMP latency to under two seconds with proven configuration tuning. Covers chunk_size, interleave, TCP_NODELAY, encoder settings, and HTTP-FLV as an HLS alternative."
cover_image: "/images/blog/uploads/nginx-rtmp-low-latency.webp"
seo_title: "Nginx RTMP Low Latency: Configuration Guide for Sub-Second Streaming"
seo_description: "Learn how to tune Nginx RTMP for low latency. Covers chunk_size, interleave, TCP optimizations, OBS encoder settings, and HTTP-FLV for sub-second delivery."
author_name: "Collin Stewart"
tags:
  - Nginx
  - RTMP
  - Streaming
  - Low Latency
  - DevOps
category: "Web Development"
reading_time: 14
featured: false
no_index: false
---

If you've ever set up an Nginx RTMP server and watched your stream arrive 30 seconds late, you know the frustration. The default configuration is built for reliability, not speed. It buffers aggressively, waits for audio and video to synchronize, and prioritizes smooth playback over real-time interaction.

For most use cases—VOD, recorded streams, non-interactive broadcasts—that's fine. But for live auctions, gaming, remote collaboration, surveillance, or any scenario where viewers interact with the stream in real time, 30 seconds of latency is unacceptable. You need sub-second delivery, and the default Nginx RTMP config won't get you there.

The good news is that Nginx RTMP has a set of directives specifically designed for low latency. Combined with the right encoder settings and TCP tuning, you can get end-to-end latency down to 1–2 seconds—sometimes less. I've tuned Nginx RTMP servers for interactive applications, and the difference between default and optimized configs is dramatic. If you need a general setup walkthrough first, our [Nginx RTMP guide](/blog/2025/july/nginx-rtmp-guide) covers installation and basic configuration. This post is about squeezing the latency out.

## Where RTMP Latency Comes From

Before tuning, it helps to understand where the delay accumulates. RTMP latency isn't a single bottleneck; it's a chain of buffering decisions at multiple layers.

**Protocol-level buffering.** RTMP splits data into chunks. The default `chunk_size` is 4096 bytes. At high bitrates, this forces frames to be fragmented into multiple chunks, each requiring acknowledgment. The result is transmission delay that adds up quickly[reference:0].

**Audio/video synchronization.** Nginx RTMP waits for audio and video packets to align before sending them. The default `sync` directive uses a 300ms window. That's 300ms of guaranteed delay before a single byte reaches the client[reference:1].

**Server-side queuing.** The server maintains internal buffers for each stream. Default buffer sizes are generous to prevent underruns, but they also hold data longer than necessary. `buffer_queue` defaults to a queue length that can accumulate frames if the client is slow.

**TCP stack behavior.** The operating system's TCP stack uses Nagle's algorithm to coalesce small packets. That's efficient for bulk transfer, but it adds latency to real-time data. The default `SO_SNDBUF` on Linux is 212,992 bytes, which is far larger than needed for low-latency streaming[reference:2].

**Encoder buffering.** The encoder itself—OBS, FFmpeg, hardware encoders—introduces delay through lookahead, B-frames, and rate control. Even a perfectly tuned server can't fix an encoder that's buffering 1.5 seconds of video before sending anything[reference:3].

The fix is to address all five layers. Tuning only the server config gets you part of the way. Tuning only the encoder gets you part of the way. You need both, plus TCP adjustments, to reach sub-second or low-single-digit latency.

## Nginx RTMP Configuration for Low Latency

Here's the configuration I use for low-latency live streaming. I'll explain each directive as we go.

```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 1024;
        max_streams 512;

        application live {
            live on;
            record off;
            interleave on;
            wait_key on;
            sync 10ms;
            buffer_queue 4;
            play_restart on;
            publish_notify off;
            drop_idle_publisher 10s;
            meta copy;

            # HLS for browser fallback (see HTTP-FLV section for lower latency)
            hls on;
            hls_path /tmp/hls;
            hls_fragment 1s;
            hls_playlist_length 3s;
        }
    }
}
```

Let's break down the directives that matter most for latency.

### chunk_size

The default is 4096 bytes. Reducing it to 1024 or even 512 reduces the transmission granularity and cuts latency, at the cost of slightly more overhead from more frequent packet processing[reference:4].

```nginx
chunk_size 1024;
```

For 1080p@30fps at a reasonable bitrate, 1024 is a good balance. If you're streaming at very high bitrates, you might need to increase it slightly to avoid excessive overhead. But for low-latency interactive streaming, smaller is better.

### interleave on

Audio and video interleaving. When enabled, audio and video packets are sent within the same TCP packets, reducing the overhead and latency of separate streams[reference:5].

```nginx
interleave on;
```

This is a clear win for live streaming. There's essentially no downside unless your client specifically requires separate audio and video streams.

### sync

The `sync` directive controls the audio/video synchronization window. The default is 300ms. Reducing it to 10ms or even lower forces tighter synchronization, which reduces latency but can cause audio glitches if the network is unstable[reference:6].

```nginx
sync 10ms;
```

For stable networks, 10ms is aggressive but works well. For less reliable connections, 50ms is a safer middle ground.

### wait_key on

When a new viewer connects, Nginx can wait for the next keyframe before starting playback. `wait_key on` makes the server wait for a keyframe, which prevents the viewer from seeing corrupted frames. This adds a small delay for the first frame but improves the viewing experience.

### buffer_queue

This controls the internal frame queue length. The default allows more buffering. Reducing it to 4 or 6 limits how many frames can queue up if the client is slow, preventing accumulation of delay[reference:7].

```nginx
buffer_queue 4;
```

If viewers experience frequent stalls, increase this value slightly. But for low latency, keep it small.

### play_restart on

When a new viewer joins, `play_restart on` immediately sends the latest keyframe instead of starting from the beginning of the buffer. This reduces first-frame latency for new viewers[reference:8].

### publish_notify off

The `publish_notify` directive triggers HTTP callbacks when a stream is published. If you're not using those callbacks, turning it off eliminates a potential blocking operation during stream setup[reference:9].

```nginx
publish_notify off;
```

### record off

Recording to disk introduces I/O that can interfere with streaming. Unless you need server-side recording, disable it.

```nginx
record off;
```

## TCP Stack Tuning for Low Latency

Nginx runs on top of the operating system's TCP stack, and the default settings are optimized for throughput, not latency. Here are the sysctl adjustments that make a difference.

```bash
# Disable Nagle's algorithm (send packets immediately)
net.ipv4.tcp_nodelay = 1

# Reduce send buffer size
net.core.wmem_default = 65536
net.core.wmem_max = 65536
net.core.rmem_default = 65536
net.core.rmem_max = 65536

# Reduce TCP FIN timeout to reclaim connections faster
net.ipv4.tcp_fin_timeout = 15

# Enable TCP window scaling
net.ipv4.tcp_window_scaling = 1
```

Apply these with `sysctl -p`. The most important one is `tcp_nodelay`. Nagle's algorithm waits for more data before sending a packet, which adds up to 200ms of latency in some cases. Disabling it forces immediate transmission[reference:10].

For Nginx itself, you can set `tcp_nodelay on` in the `rtmp` block if your build supports it, but the sysctl setting affects all TCP connections, which is usually what you want.

## Encoder Settings: The Other Half of the Equation

Even a perfectly tuned server can't fix an encoder that's buffering 1.5 seconds of video. The encoder is where the first frame is delayed, and those milliseconds propagate through the entire pipeline.

For OBS Studio (the most common RTMP encoder), these settings matter most:

**Rate control: CQP instead of CBR.** Constant Bitrate (CBR) uses a buffer that accumulates frames to smooth out bitrate fluctuations. That buffer adds latency. Constant Quantization Parameter (CQP) encodes each frame at a fixed quality, eliminating the buffer delay. CQP=23 is a good starting point[reference:11].

**Keyframe interval (GOP): 1–2 seconds.** A shorter GOP means more frequent keyframes, which reduces the wait for new viewers and helps the server recover from packet loss. For 30fps, set keyframe interval to 30–60 frames[reference:12].

**Disable B-frames.** B-frames require the encoder to buffer frames for reordering. Set `bframes=0` in your encoder settings[reference:13].

**Tune for zero latency.** If you're using x264, add `tune=zerolatency` to your encoder settings. This disables lookahead and frame reordering, minimizing encoder-side buffering[reference:14].

**Disable lookahead.** Some encoders use lookahead to improve quality by analyzing future frames. That analysis requires buffering frames. Turn it off for real-time streaming.

If you're using FFmpeg as your encoder, the equivalent settings look like this:

```bash
ffmpeg -i input \
  -c:v libx264 \
  -preset ultrafast \
  -tune zerolatency \
  -x264-params "keyint=60:min-keyint=60:bframes=0:rc-lookahead=0" \
  -b:v 2500k \
  -maxrate 2500k \
  -bufsize 2500k \
  -c:a aac -b:a 128k \
  -f flv rtmp://localhost/live/stream
```

The `bufsize` matching `maxrate` prevents the encoder from accumulating a buffer. Setting `bufsize` higher than `maxrate` reintroduces latency.

If you're building a streaming pipeline with FFmpeg and need to handle concurrent operations, our guide on [Promise.all vs Promise.allSettled](/blog/promise-all-vs-promise-allsettled) covers patterns for managing parallel tasks gracefully.

## HTTP-FLV: The Real Low-Latency Browser Protocol

Here's the thing most Nginx RTMP guides don't tell you: RTMP itself is a low-latency protocol. The problem is that browsers can't play RTMP natively. You have to transcode to HLS, which adds 10–30 seconds of segment buffering latency[reference:15].

HTTP-FLV solves this. It delivers the RTMP stream over standard HTTP as an FLV container. Browsers can play HTTP-FLV streams using JavaScript players like `flv.js`, without plugins. And because HTTP-FLV delivers a continuous byte stream rather than discrete segments, it achieves sub-second latency—the same order of magnitude as raw RTMP[reference:16].

The NGINX HTTP-FLV module is a superset of the standard nginx-rtmp-module. It includes all the RTMP features plus HTTP-FLV live streaming, GOP caching, and JSON statistics. If you're already using nginx-rtmp-module, switching is a drop-in upgrade—existing configs remain compatible[reference:17].

```nginx
http {
    server {
        listen 8080;

        location /live {
            flv_live on;
            chunked_transfer_encoding on;
            add_header 'Access-Control-Allow-Origin' '*';
        }
    }
}
```

On the client side:

```javascript
import flvjs from "flv.js";

if (flvjs.isSupported()) {
  const player = flvjs.createPlayer({
    type: "flv",
    url: "http://your-server:8080/live/stream.flv",
  });
  player.attachMediaElement(videoElement);
  player.load();
  player.play();
}
```

HTTP-FLV gives you the best of both worlds: browser compatibility and low latency. If you're building an interactive streaming application, it's worth considering over HLS.

If you're comparing HTTP-FLV to other streaming protocols, our guide on [WebSocket vs SSE](/blog/websocket-vs-sse) covers real-time communication alternatives for different use cases.

## When RTMP Isn't Enough: SRT and WebRTC

RTMP over TCP has inherent limitations. TCP guarantees delivery, but it does so by buffering and retransmitting. On lossy networks, TCP backs off and increases latency to maintain reliability. RTMP "hides" network problems by buffering, which means your latency grows when conditions worsen[reference:18].

SRT (Secure Reliable Transport) is designed for exactly this scenario. It runs over UDP, enforces a strict latency window, and uses selective retransmission instead of TCP's all-or-nothing approach. On congested or long-distance links, SRT maintains lower latency than RTMP because it doesn't wait for every packet to arrive before moving on[reference:19].

For local networks or stable connections, RTMP is fine. For unpredictable networks—cellular, cross-continent, wireless—SRT or WebRTC are better choices. WebRTC achieves sub-500ms latency but requires a signaling server and a different architecture. If you've been comparing real-time protocols, our [WebSocket vs SSE](/blog/websocket-vs-sse) guide covers the tradeoffs for different real-time use cases.

## A Real Story: Getting from 8 Seconds to 1.5 Seconds

A client came to me with a surveillance streaming setup. They had cameras pushing RTMP to an Nginx server, and operators monitoring the feeds in a browser. The problem: the feeds were 8 seconds behind live. For a security application, that's useless—by the time you see an intruder, they've already moved on.

We audited the pipeline layer by layer. The encoder was using CBR with a large buffer. The server had default `chunk_size` and `sync 300ms`. The output was HLS with 6-second segments. Every layer was adding delay.

We changed the encoder to CQP with `tune=zerolatency` and a 1-second GOP. We dropped `chunk_size` to 1024 and `sync` to 10ms. We switched from HLS to HTTP-FLV for browser playback. We disabled Nagle's algorithm on the server.

The result: 1.5 seconds end-to-end. Not sub-second, but a five-fold improvement that made the feeds actually usable for real-time monitoring. The operators could react to events as they happened.

The lesson: latency is a pipeline problem. Tuning one layer helps. Tuning all layers transforms the experience.

## Wrapping Up

Nginx RTMP low latency isn't a single setting—it's a combination of configuration tuning, encoder settings, TCP adjustments, and protocol choices. The server-side directives (`chunk_size`, `interleave`, `sync`, `buffer_queue`) reduce the server's contribution to latency. The encoder settings (`zerolatency`, CQP, short GOP) reduce the encoder's contribution. TCP tuning (`tcp_nodelay`, reduced buffers) reduces the OS contribution. And switching from HLS to HTTP-FLV eliminates the segment buffering that adds 10–30 seconds on top of everything else.

Start with the config changes. They're the easiest to implement and often yield the biggest improvement. Then tune the encoder. Then optimize TCP. And if you need browser playback, use HTTP-FLV instead of HLS.

For the general Nginx RTMP setup, see our [Nginx RTMP guide](/blog/2025/july/nginx-rtmp-guide). For caching strategies that reduce load on your streaming origin, our [Redis cache design patterns](/blog/redis-cache-design-patterns) guide covers server-side caching. And if you're comparing real-time protocols, our [WebSocket vs SSE](/blog/websocket-vs-sse) guide covers the alternatives.

Now go make your streams fast.

---

_Need help building a low-latency streaming pipeline or optimizing your Nginx RTMP server? Red Surge Technology specializes in real-time infrastructure and high-performance streaming. [Get in touch](/contact) to discuss your project._
