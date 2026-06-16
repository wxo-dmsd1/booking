const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const page3 = document.getElementById("page3");
const toPage3 = document.getElementById("toPage3");

let entered = false;
let bookInitialized = false;


/* page1 → page2 */

page1.addEventListener("click", () => {

    if (entered) return;
    entered = true;

    page1.classList.add("fade-out");

    setTimeout(() => {

        page1.style.display = "none";

        page2.classList.add("active");
        page2.style.opacity = "0";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                page2.style.opacity = "1";
            });
        });

    }, 800);

});


/* page2 → page3 */

if (toPage3) {
    toPage3.addEventListener("click", () => {

        page2.classList.add("fade-out");

        setTimeout(() => {

            page2.style.display = "none";

            page3.classList.add("active");
            page3.style.opacity = "0";

            window.scrollTo(0, 0);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {

                    page3.style.opacity = "1";

                    if (!bookInitialized) {
                        initBookViewer();
                        bookInitialized = true;
                    }

                });
            });

        }, 800);

    });
} else {
    console.error("toPage3 요소를 찾을 수 없습니다. HTML에서 id='toPage3'가 있는지 확인하세요.");
}


/* 3D Book Viewer */

function initBookViewer() {

    const container = document.getElementById("bookViewer");

    if (!container) {
        console.error("bookViewer 요소를 찾을 수 없습니다. page3 안에 <div id='bookViewer'></div>가 있는지 확인하세요.");
        return;
    }

    if (typeof THREE === "undefined") {
        console.error("Three.js가 로드되지 않았습니다. HTML에서 script.js보다 위에 Three.js CDN을 넣었는지 확인하세요.");
        return;
    }

    const pageImages = [
        "images/page01.png",
        "images/page02.png",
        "images/page03.png",
        "images/page04.png",
        "images/page05.png",
        "images/page06.png",
        "images/page07.png",
        "images/page08.png",
        "images/page09.png",
        "images/page10.png",
        "images/page11.png",
        "images/page12.png",
        "images/page13.png",
        "images/page14.png",
        "images/page15.png",
        "images/page16.png",
        "images/page17.png",
        "images/page18.png",
        "images/page19.png",
        "images/page20.png",
        "images/page21.png",
        "images/page22.png",
        "images/page23.png",
        "images/page24.png"
    ];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 0.6, 7.5);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const bookGroup = new THREE.Group();
    bookGroup.position.y = 0.65;
    scene.add(bookGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.7);
    mainLight.position.set(3, 5, 6);
    scene.add(mainLight);

    const subLight = new THREE.DirectionalLight(0xffffff, 0.6);
    subLight.position.set(-4, 2, -3);
    scene.add(subLight);


    /* Texture Loading */

    const loader = new THREE.TextureLoader();

    const textures = pageImages.map((src, index) => {

        const texture = loader.load(
            src,

            () => {
                console.log(`이미지 로드 성공: ${src}`);
                texture.needsUpdate = true;
            },

            undefined,

            (error) => {
                console.error(`이미지 로드 실패: ${src}`, error);
                console.warn("파일 이름, images 폴더 위치, Live Server 실행 여부를 확인하세요.");
            }
        );

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        return texture;
    });


    /* Book Size */

    const pageWidth = 2.25;
    const pageHeight = 3.2;
    const pageThickness = 0.035;

    let currentSpread = 0;
    let isAnimating = false;


    function clearBook() {
        while (bookGroup.children.length > 0) {
            const obj = bookGroup.children[0];

            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }

            bookGroup.remove(obj);
        }
    }


    function createPage(texture, x, y, z, rotationY = 0) {

        const geometry = new THREE.BoxGeometry(
            pageWidth,
            pageHeight,
            pageThickness
        );

        const pageMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.78,
            metalness: 0,
            side: THREE.DoubleSide
        });

        const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.9,
            metalness: 0
        });

        /*
            BoxGeometry material order:
            0 right
            1 left
            2 top
            3 bottom
            4 front
            5 back
        */

        const materials = [
            sideMaterial,
            sideMaterial,
            sideMaterial,
            sideMaterial,
            pageMaterial,
            pageMaterial
        ];

        const page = new THREE.Mesh(geometry, materials);
        page.position.set(x, y, z);
        page.rotation.y = rotationY;

        bookGroup.add(page);

        return page;
    }


    function createStack() {

        const stackGeometry = new THREE.BoxGeometry(
            pageWidth * 2 + 0.12,
            pageHeight,
            0.2
        );

        const stackMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.95
        });

        const stack = new THREE.Mesh(stackGeometry, stackMaterial);
        stack.position.set(0, -0.025, -0.14);
        bookGroup.add(stack);

        const spineGeometry = new THREE.BoxGeometry(
            0.12,
            pageHeight,
            0.24
        );

        const spineMaterial = new THREE.MeshStandardMaterial({
            color: 0xd7d7d7,
            roughness: 0.9
        });

        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.set(0, -0.015, -0.03);
        bookGroup.add(spine);
    }


    function showClosedBook() {

        clearBook();

        const coverGeometry = new THREE.BoxGeometry(
            pageWidth,
            pageHeight,
            0.28
        );

        const coverMaterial = new THREE.MeshStandardMaterial({
            map: textures[0],
            roughness: 0.75,
            metalness: 0,
            side: THREE.DoubleSide
        });

        const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0xe5e5e5,
            roughness: 0.9
        });

        const materials = [
            sideMaterial,
            sideMaterial,
            sideMaterial,
            sideMaterial,
            coverMaterial,
            coverMaterial
        ];

        const cover = new THREE.Mesh(coverGeometry, materials);
        bookGroup.add(cover);

        bookGroup.rotation.set(-0.18, -0.35, 0);
        bookGroup.scale.set(1, 1, 1);
    }


    function showSpread() {

        clearBook();
        createStack();

        const leftIndex = currentSpread * 2 - 1;
        const rightIndex = currentSpread * 2;

        const leftTexture = textures[leftIndex];
        const rightTexture = textures[rightIndex];

        const leftPage = createPage(
            leftTexture,
            -pageWidth / 2 - 0.04,
            0,
            0.06,
            0.035
        );

        const rightPage = createPage(
            rightTexture,
            pageWidth / 2 + 0.04,
            0,
            0.06,
            -0.035
        );

        leftPage.rotation.z = 0.01;
        rightPage.rotation.z = -0.01;

        bookGroup.rotation.set(-0.25, 0, 0);
        bookGroup.scale.set(1, 1, 1);
    }


    function nextPage() {

        if (isAnimating) return;
        isAnimating = true;

        currentSpread++;

        const maxSpread = Math.floor((textures.length - 1) / 2);

        if (currentSpread > maxSpread) {
            currentSpread = 0;
        }

        const startScale = 1;
        const middleScale = 0.94;
        let startTime = null;

        function shrink(time) {

            if (!startTime) startTime = time;

            const progress = Math.min((time - startTime) / 120, 1);
            const scale = startScale + (middleScale - startScale) * progress;

            bookGroup.scale.set(scale, scale, scale);

            if (progress < 1) {
                requestAnimationFrame(shrink);
            } else {

                if (currentSpread === 0) {
                    showClosedBook();
                } else {
                    showSpread();
                }

                startTime = null;
                requestAnimationFrame(grow);
            }
        }

        function grow(time) {

            if (!startTime) startTime = time;

            const progress = Math.min((time - startTime) / 140, 1);
            const scale = middleScale + (startScale - middleScale) * progress;

            bookGroup.scale.set(scale, scale, scale);

            if (progress < 1) {
                requestAnimationFrame(grow);
            } else {
                startTime = null;
                isAnimating = false;
            }
        }

        requestAnimationFrame(shrink);
    }


    /* Initial Book */

    showClosedBook();


    /* Drag Rotation */

    let isDragging = false;
    let hasDragged = false;
    let previousX = 0;
    let previousY = 0;

    container.addEventListener("mousedown", (e) => {

        isDragging = true;
        hasDragged = false;

        previousX = e.clientX;
        previousY = e.clientY;

    });

    window.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasDragged = true;
        }

        bookGroup.rotation.y += deltaX * 0.008;
        bookGroup.rotation.x += deltaY * 0.006;

        bookGroup.rotation.x = Math.max(
            -0.85,
            Math.min(0.5, bookGroup.rotation.x)
        );

        previousX = e.clientX;
        previousY = e.clientY;

    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    container.addEventListener("click", () => {

        if (hasDragged) return;

        nextPage();

    });


    /* Touch Support */

    container.addEventListener("touchstart", (e) => {

        isDragging = true;
        hasDragged = false;

        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;

    });

    container.addEventListener("touchmove", (e) => {

        if (!isDragging) return;

        const deltaX = e.touches[0].clientX - previousX;
        const deltaY = e.touches[0].clientY - previousY;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            hasDragged = true;
        }

        bookGroup.rotation.y += deltaX * 0.008;
        bookGroup.rotation.x += deltaY * 0.006;

        bookGroup.rotation.x = Math.max(
            -0.85,
            Math.min(0.5, bookGroup.rotation.x)
        );

        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;

    });

    container.addEventListener("touchend", () => {

        isDragging = false;

        if (!hasDragged) {
            nextPage();
        }

    });


    /* Resize */

    window.addEventListener("resize", () => {

        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.clientWidth, container.clientHeight);

    });


    /* Render Loop */

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}




const customCursor = document.getElementById("customCursor");

window.addEventListener("mousemove", (e) => {
    customCursor.style.left = e.clientX + "px";
    customCursor.style.top = e.clientY + "px";
});