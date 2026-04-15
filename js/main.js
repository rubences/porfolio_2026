(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav__links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const revealNodes = document.querySelectorAll('.reveal');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  const highlightNav = () => {
    let currentId = '';

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 140) {
        currentId = section.id;
      }
    });

    navItems.forEach((item) => {
      item.classList.toggle('is-active', item.getAttribute('href') === `#${currentId}`);
    });
  };

  updateHeaderState();
  highlightNav();

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('scroll', highlightNav, { passive: true });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }

  const initParallax = () => {
    const layers = Array.from(document.querySelectorAll('[data-parallax]'));

    if (!layers.length || prefersReducedMotion()) {
      return;
    }

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      current.x += (pointer.x - current.x) * 0.08;
      current.y += (pointer.y - current.y) * 0.08;

      const scrollOffset = window.scrollY;

      layers.forEach((layer) => {
        const speed = Number(layer.dataset.speed || 0.1);
        const rotate = Number(layer.dataset.rotate || 0);
        const offsetX = current.x * speed * 34;
        const offsetY = current.y * speed * 28 - scrollOffset * speed * 0.04;
        const offsetRotate = current.x * rotate;

        layer.style.setProperty('--parallax-x', `${offsetX.toFixed(2)}px`);
        layer.style.setProperty('--parallax-y', `${offsetY.toFixed(2)}px`);
        layer.style.setProperty('--parallax-rotate', `${offsetRotate.toFixed(2)}deg`);
      });

      window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.requestAnimationFrame(tick);
  };

  const initThreeScene = () => {
    const canvas = document.getElementById('heroCanvas');

    if (!canvas || !window.THREE) {
      return;
    }

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const ambientLight = new THREE.AmbientLight(0x90f0df, 0.75);
    const primaryLight = new THREE.PointLight(0x6ce6cf, 16, 18, 2);
    const warmLight = new THREE.PointLight(0xff8d63, 14, 16, 2);
    primaryLight.position.set(3.2, 2.6, 4.4);
    warmLight.position.set(-3, -2, 3.6);

    scene.add(ambientLight, primaryLight, warmLight);

    const cluster = new THREE.Group();
    scene.add(cluster);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.28, 2),
      new THREE.MeshStandardMaterial({
        color: 0x6ce6cf,
        emissive: 0x0a3f45,
        emissiveIntensity: 0.65,
        metalness: 0.4,
        roughness: 0.28,
        wireframe: true,
      })
    );

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 3),
      new THREE.MeshBasicMaterial({
        color: 0xffd0bf,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      })
    );

    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.028, 20, 180),
      new THREE.MeshBasicMaterial({
        color: 0xff8d63,
        transparent: true,
        opacity: 0.7,
      })
    );
    ringA.rotation.x = Math.PI / 2.4;
    ringA.rotation.y = 0.45;

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.022, 16, 180),
      new THREE.MeshBasicMaterial({
        color: 0x6ce6cf,
        transparent: true,
        opacity: 0.35,
      })
    );
    ringB.rotation.x = Math.PI / 1.9;
    ringB.rotation.z = 0.38;

    cluster.add(core, shell, ringA, ringB);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1100;
    const positions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3;
      const radius = 3 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[stride] = radius * Math.sin(phi) * Math.cos(theta);
      positions[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[stride + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xf6c66b,
        size: 0.034,
        transparent: true,
        opacity: 0.85,
      })
    );

    scene.add(particles);

    const pointer = { x: 0, y: 0 };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const renderFrame = (time) => {
      const t = time * 0.00045;

      cluster.rotation.y += 0.003;
      cluster.rotation.x += 0.0018;
      shell.rotation.x -= 0.0026;
      shell.rotation.y += 0.0018;
      ringA.rotation.z += 0.004;
      ringB.rotation.z -= 0.0024;
      particles.rotation.y = t * 0.22;
      particles.rotation.x = t * 0.12;

      cluster.rotation.y += (pointer.x * 0.38 - cluster.rotation.y) * 0.02;
      cluster.rotation.x += ((-pointer.y) * 0.22 - cluster.rotation.x) * 0.02;

      renderer.render(scene, camera);

      if (!prefersReducedMotion()) {
        window.requestAnimationFrame(renderFrame);
      }
    };

    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });
    resize();
    renderer.render(scene, camera);

    if (!prefersReducedMotion()) {
      window.requestAnimationFrame(renderFrame);
    }
  };

  initParallax();
  initThreeScene();
})();
