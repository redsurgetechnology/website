function scrollToTargetAdjusted(target) {
    var element = document.getElementById(target);
    var headerOffset = 100;
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}