// HFD Logistic Service - Interactivity Script

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Header
    const header = document.getElementById('main-header');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('HFD/');
    
    const handleScroll = () => {
        if (isHomePage) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        } else {
            header.classList.add('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on load

    // 2. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            // On homepage, give header solid background when menu is open
            if (isHomePage && window.scrollY <= 50) {
                if (navMenu.classList.contains('active')) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                // Restore transparent header on homepage if at top
                if (isHomePage && window.scrollY <= 50) {
                    header.classList.remove('scrolled');
                }
            });
        });

        // Reset menu state on screen resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                // Restore transparent header on homepage if at top
                if (isHomePage && window.scrollY <= 50) {
                    header.classList.remove('scrolled');
                }
            }
        });
    }

    // 3. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Scroll Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');

        const validateField = (input) => {
            const errorId = `${input.id}-error`;
            const errorSpan = document.getElementById(errorId);
            let isValid = true;

            if (input.required && !input.value.trim()) {
                isValid = false;
            } else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                }
            }

            if (!isValid) {
                if (errorSpan) errorSpan.style.display = 'block';
                input.style.borderColor = 'var(--accent-magenta)';
            } else {
                if (errorSpan) errorSpan.style.display = 'none';
                input.style.borderColor = 'var(--primary-color)';
            }

            return isValid;
        };

        inputs.forEach(input => {
            input.addEventListener('input', () => validateField(input));
            input.addEventListener('blur', () => validateField(input));
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isFormValid = true;

            inputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                const submitBtn = contactForm.querySelector('button');
                const originalText = submitBtn.innerText;
                submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';

            // Submit form data to Formspree
            const formData = new FormData(contactForm);
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('¡Gracias! Su mensaje ha sido enviado con éxito.');
                    contactForm.reset();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error al enviar el mensaje.');
                    });
                }
            })
            .catch(error => {
                alert('Error al enviar el formulario: ' + error.message);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
                inputs.forEach(input => input.style.borderColor = '');
            });
            }
        });
    }

    // 6. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        const currentTheme = localStorage.getItem('theme') || 'light';

        // Apply initial theme
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
            
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 500);
        });
    }

    // 7. TRM API Integration (Datos Abiertos Colombia)
    const trmValueEl = document.getElementById('trm-value');
    const trmDateEl = document.getElementById('trm-date');

    if (trmValueEl && trmDateEl) {
        const fetchTRM = async () => {
            const endpoint = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciahasta%20DESC';
            
            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`HTTP error status: ${response.status}`);
                }
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const trmRecord = data[0];
                    const numericValue = parseFloat(trmRecord.valor);
                    
                    // Format numeric value as COP currency ($ 3.920,50 COP)
                    const formattedCOP = new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(numericValue);
                    
                    // Format date (e.g. 12 de agosto de 2026)
                    const rawDate = trmRecord.vigenciahasta || trmRecord.vigenciadesde;
                    let formattedDateStr = rawDate;
                    if (rawDate) {
                        const dateParts = rawDate.split('T')[0].split('-');
                        if (dateParts.length === 3) {
                            const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                            formattedDateStr = dateObj.toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        }
                    }

                    trmValueEl.textContent = `${formattedCOP} COP`;
                    trmDateEl.textContent = formattedDateStr;
                } else {
                    throw new Error('No TRM data received');
                }
            } catch (error) {
                console.warn('Fallback TRM activated:', error);
                trmValueEl.textContent = '$ 4.150,00 COP';
                trmDateEl.textContent = new Date().toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
        };

        fetchTRM();
    }
});
