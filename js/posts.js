function scrollToTargetAdjusted(id) {
    const headerOffset = 100;
    const element = document.getElementById(id);

    // read once
    const { top: elementTop } = element.getBoundingClientRect();
    const targetY = elementTop + window.pageYOffset - headerOffset;

    // write once
    window.scrollTo({ top: targetY, behavior: 'smooth' });
}