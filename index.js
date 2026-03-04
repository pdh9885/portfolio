// index.js

$(function () {
    const $win = $(window);
    const $doc = $("html, body");

    const $links = $(".gnb a");
    const $items = $(".gnb li");
    const $sections = $(".page"); // #home, #portfolio, #contact

    const headerH = $("header").outerHeight() || 0;

    let isAutoScrolling = false;  // animate 중 scroll-spy 무시
    let ticking = false;          

    function setActiveById(id) {
        // id 예: "home", "portfolio", "contact"
        $items.removeClass("active");
        $links
            .filter(`[href="#${id}"]`)
            .parent("li")
            .addClass("active");
    }

    function updateActiveByScroll() {
        // 헤더에 가려지는 걸 고려해 기준선을 조금 아래로 둠
        const scrollPos = $win.scrollTop() + headerH + 1;

        let currentId = $sections.first().attr("id");

        $sections.each(function () {
            const $sec = $(this);
            const top = $sec.offset().top;

            if (top <= scrollPos) {
                currentId = $sec.attr("id");
            } else {
                // 아래 섹션은 더 볼 필요 없음
                return false;
            }
        });

        setActiveById(currentId);
    }

    // 1) 메뉴 클릭: active 먼저 바꾸고, animate 동안 scroll-spy 잠깐 정지
    $links.on("click", function (e) {
        e.preventDefault();

        const href = $(this).attr("href"); 
        const $target = $(href);
        if (!$target.length) return;

        // 클릭된 메뉴 active
        $(this).parent("li").addClass("active").siblings().removeClass("active");

        // 목표 스크롤 위치 
        const targetTop = $target.offset().top;

        isAutoScrolling = true;

        // 기존 animate가 있으면 멈추고 새로 시작
        $doc.stop().animate(
            { scrollTop: targetTop },
            400,
            function () {
                // 애니메이션이 끝난 뒤에만 scroll-spy 다시 활성화 + 정확히 동기화
                isAutoScrolling = false;
                updateActiveByScroll();
            }
        );
    });

    // 2) 스크롤: animate로 움직이는 동안에는 무시, 그 외에는 rAF로 스로틀
    $win.on("scroll", function () {
        if (isAutoScrolling) return;

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(function () {
                updateActiveByScroll();
                ticking = false;
            });
        }
    });

    // 3) 최초 진입/새로고침/리사이즈 시에도 동기화
    $win.on("load resize", function () {
        updateActiveByScroll();
    });

    // 초기 1회
    updateActiveByScroll();
});
