let currentPage = 0;
const pages = document.querySelectorAll('.page');

function showPage(pageIndex) {
    const totalPages = pages.length;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    currentPage = pageIndex;
    const book = document.querySelector('.book');
    book.style.transform = `translateX(-${currentPage * 100}vw)`;
}

window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        showPage(currentPage + 1); // Scroll down
    } else {
        showPage(currentPage - 1); // Scroll up
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('mousedown', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        // Scroll to target with GSAP
        gsap.to(window, {
            duration: 1,
            scrollTo: {
                y: target,
                offsetY: 70,
                autoKill: false // Prevents interruption of scroll
            },
            ease: "power3.inOut"
        });
    }, { passive: false }); // Improve scroll performance
});

// Remove any existing click event listeners
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.removeEventListener('click', function(){});
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Form submission handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = Object.fromEntries(formData);
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Reset form
        this.reset();
        alert('Thank you for your message! I will get back to you soon.');
    });
}

// Three.js setup
let scene, camera, renderer;
let particles = [];
let stars = [];
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let cursorParticles = [];
let cursorTrail;
let mouse = new THREE.Vector2();
let lastMouse = new THREE.Vector2();
let mouseVelocity = new THREE.Vector2();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    
    camera.position.set(25, 0, 25);

    // Add space fog
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff2e6, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffdab3, 2.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create stars
    function addStar() {
        const size = Math.random() * 0.2;
        const geometry = new THREE.SphereGeometry(size, 24, 24);
        const material = new THREE.MeshStandardMaterial({
            color: 0xfff2e6,
            emissive: 0xffdab3,
            emissiveIntensity: Math.random() * 0.5 + 0.5,
            opacity: 0.8,
            transparent: true
        });
        const star = new THREE.Mesh(geometry, material);

        const radius = 50 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        star.position.x = (radius * Math.sin(phi) * Math.cos(theta)) - 15;
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        scene.add(star);
        stars.push(star);
    }

    // Add more stars
    Array(800).fill().forEach(addStar); // Increased number of stars

    // Add distant stars
    for(let i = 0; i < 500; i++) {
        const size = Math.random() * 0.05;
        const geometry = new THREE.SphereGeometry(size, 24, 24);
        const material = new THREE.MeshStandardMaterial({
            color: 0xfff2e6,
            emissive: 0xffdab3,
            emissiveIntensity: Math.random() * 0.3 + 0.2,
            opacity: 0.6,
            transparent: true
        });
        const star = new THREE.Mesh(geometry, material);

        const radius = 80 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        star.position.x = (radius * Math.sin(phi) * Math.cos(theta)) - 15;
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        scene.add(star);
        stars.push(star);
    }

    // Add cosmic dust
    const dustParticles = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({
            color: 0xfff2e6, // Warm white
            size: 0.05, // Slightly smaller for more delicate effect
            transparent: true,
            opacity: 0.3, // Slightly lower opacity for layered effect
            blending: THREE.AdditiveBlending
        })
    );

    const dustPositions = [];
    // Increase number of particles from 1500 to 3000
    for(let i = 0; i < 3000; i++) {
        const radius = 15 + Math.random() * 40; // Wider radius range
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Add some randomness to distribution
        const randomOffset = Math.random() * 5;
        const x = (radius * Math.sin(phi) * Math.cos(theta)) - 15 + randomOffset;
        const y = radius * Math.sin(phi) * Math.sin(theta) + randomOffset;
        const z = radius * Math.cos(phi) + randomOffset;
        dustPositions.push(x, y, z);
    }

    dustParticles.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(dustPositions, 3)
    );
    scene.add(dustParticles);
    particles.push({ mesh: dustParticles, type: 'dust' });

    // Event listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
    
    // Update mouse position for cursor trail
    const pos = getMousePosition(event);
    mouse.x = pos.x;
    mouse.y = pos.y;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate stars with subtle twinkle effect
    stars.forEach((star, index) => {
        star.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.001 + index) * 0.5;
    });

    // Camera movement
    targetX = mouseX * 0.2 - 15;
    targetY = mouseY * 0.2;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(-15, 0, 0);

    // Animate dust
    particles.forEach((particle) => {
        if (particle.type === 'dust') {
            particle.mesh.rotation.y += 0.0002;
        }
    });

    renderer.render(scene, camera);
}

function getMousePosition(event) {
    const vector = new THREE.Vector3();
    
    // Convert mouse position to 3D coordinates
    vector.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
    );
    
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    return pos;
}

// Initialize Three.js scene
init();

// Remove old page navigation code
const oldEventListener = window.removeEventListener('wheel', function(){});

// Remove the old cursor trail code and add this new version
let trailArr = [1, .9, .8, .5, .25, .6, .4, .3, .2];
var sparklesArr = [];

function trailAnimation(e, i, maxYTranslation) {
    let elem = document.createElement('div');

    elem = styleSparkle(elem, e, i);
    elem.classList.add("sparkle");
    document.body.appendChild(elem);

    elem = addAnimationProperties(elem, i, maxYTranslation);
    sparklesArr.push(elem);
}

function styleSparkle(elem, e, i) {
    let j = (1 - i) * 50;
    let size = Math.ceil(Math.random() * 10 * i) + 'px';
    
    elem.style.top = e.pageY - window.scrollY + Math.round(Math.random() * j - j / 2) + 'px';
    elem.style.left = e.pageX + Math.round(Math.random() * j - j / 2) + 'px';
    
    elem.style.width = size;
    elem.style.height = size;
    elem.style.borderRadius = size;
    
    // Update to golden colors
    elem.style.background = 'hsla(' +
        (40 + Math.random() * 10) + ', ' + // Golden hue
        '90%, ' + // High saturation
        (50 + Math.random() * 40) + '%, ' + // Varying lightness
        i + ')';
    
    // Add glow effect
    elem.style.boxShadow = '0 0 ' + Math.random() * 5 + 'px rgba(255, 215, 0, 0.5)';
    
    return elem;
}

function addAnimationProperties(elem, i, maxYTranslation) {
    const ANIMATION_SPEED = 1100;
    let lifeExpectancy = Math.round(Math.random() * i * ANIMATION_SPEED);

    elem.maxYTranslation = maxYTranslation;
    elem.animationSpeed = ANIMATION_SPEED;
    elem.created = Date.now();
    elem.diesAt = elem.created + lifeExpectancy;

    return elem;
}

function moveSparkles() {
    let remove = false;
    let moveIndex = 0;
    let sparkle;

    for (let i = 0; i < sparklesArr.length; i++) {
        sparkle = sparklesArr[i];
        remove = sparkle.diesAt <= Date.now();
        
        if (remove) {
            document.body.removeChild(sparkle);
        } else {
            if (sparkle.maxYTranslation) {
                let interpolation = calculateInterpolation(sparkle);
                sparkle.style.transform = `translateY(${interpolation}px)`;
            }
            sparklesArr[moveIndex++] = sparkle;
        }
    }
    
    sparklesArr.length = moveIndex;
    requestAnimationFrame(moveSparkles);
}

function calculateInterpolation(sparkle) {
    let currentMillis = Date.now();
    let lifeProgress = (currentMillis - sparkle.created) / sparkle.animationSpeed;
    let interpolation = sparkle.maxYTranslation * lifeProgress;
    
    return interpolation;
}

// Update the mousemove event listener
window.addEventListener('mousemove', function (e) {
    // Regular trail
    trailArr.forEach((i) => {trailAnimation(e, i)});

    // Falling trail
    let maxYTranslation = '80';
    trailArr.forEach((i) => {trailAnimation(e, i, maxYTranslation)});
}, false);

// Start the animation loop
moveSparkles();

// Add this after your existing Three.js initialization

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initial page load animation
gsap.from(".hero-left", {
    duration: 1.5,
    x: -100,
    opacity: 0,
    ease: "power4.out"
});

gsap.from(".hero-image", {
    duration: 1.5,
    x: 100,
    opacity: 0,
    ease: "power4.out",
    delay: 0.2
});

gsap.from(".nav-content", {
    duration: 1.2,
    y: -100,
    opacity: 0,
    ease: "power4.out"
});

// Scroll animations
gsap.from(".about", {
    scrollTrigger: {
        trigger: ".about",
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out"
});

gsap.from(".skills span", {
    scrollTrigger: {
        trigger: ".skills",
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
    },
    duration: 0.8,
    scale: 0,
    opacity: 0,
    stagger: 0.1,
    ease: "back.out(1.7)"
});

gsap.from(".project-card", {
    scrollTrigger: {
        trigger: ".projects",
        start: "top 70%",
        end: "top 20%",
        toggleActions: "play none none reverse"
    },
    duration: 1,
    y: 100,
    opacity: 0,
    stagger: 0.2,
    ease: "power3.out"
});

gsap.from(".contact", {
    scrollTrigger: {
        trigger: ".contact",
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
    },
    duration: 1,
    scale: 0.8,
    opacity: 0,
    ease: "power3.out"
});

gsap.from(".social-links a", {
    scrollTrigger: {
        trigger: ".social-links",
        start: "top 90%",
        toggleActions: "play none none reverse"
    },
    duration: 0.5,
    y: 30,
    opacity: 0,
    stagger: 0.1,
    ease: "back.out(1.7)"
});

// Hover animations
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            duration: 0.3,
            y: -10,
            scale: 1.02,
            boxShadow: "0 10px 20px rgba(255, 215, 0, 0.3)"
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            duration: 0.3,
            y: 0,
            scale: 1,
            boxShadow: "none"
        });
    });
});
