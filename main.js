// Portfolio Website JavaScript
class PortfolioApp {
  constructor() {
    this.init();
    this.bindEvents();
    this.setupIntersectionObserver();
    this.setupScrollEffects();
    this.setupHeroBlur();
  }

  init() {
    // Initialize application
    this.mobileMenuOpen = false;
    this.currentSection = "hero";
    this.isScrolling = false;

    // Debounce scroll handler
    this.debouncedScrollHandler = this.debounce(
      this.handleScroll.bind(this),
      10
    );

    // Project data (actual projects from CV)
    this.projectData = {
      project1: {
        title: "AtlasKRD — High-Traffic Content Delivery Platform",
        description:
          "Engineered a secure, scalable platform handling over 750,000 daily requests for web and mobile clients. Architected and migrated the backend to a cloud-based solution, achieving a 99.5% cost reduction while improving reliability.",
        technologies: ["Cloudflare Workers/R2", "Vercel", "Supabase", "CI/CD"],
        features: [
          "High-throughput request handling",
          "Cost-optimized backend architecture",
          "Automated CI/CD deployments",
          "Custom secure access system",
        ],
        challenges:
          "Balancing performance with cost constraints and ensuring reliable delivery under heavy load.",
        outcome:
          "Reduced hosting costs from $1,500/mo to ~$7/mo while improving reliability and scalability.",
      },
      project2: {
        title: "NutrAI — AI-Based Data Analysis Platform",
        description:
          "Full-stack application integrating Google Gemini for intelligent data processing and image recognition. Built a responsive interface for presenting complex data and personalized recommendations; recognized as a top-ranked project at DPU Software Expo 2025.",
        technologies: ["Google Gemini", "React", "Supabase", "Next.js"],
        features: [
          "Image-based ingredient detection",
          "Personalized meal recommendations",
          "Interactive analytics dashboard",
        ],
        challenges:
          "Integrating third-party AI APIs and presenting complex results in an accessible UI.",
        outcome: "Top-ranked project at DPU Software Expo 2025.",
      },
      project3: {
        title: "3D Wind Turbine Prototype",
        description:
          "Designed a detailed 3D engineering model in SketchUp as part of an international team. The prototype was developed for the IREX Global Solutions Challenge and secured 3rd place.",
        technologies: ["SketchUp", "Collaborative remote development"],
        features: [
          "3D engineering modeling",
          "Sustainability-focused design",
          "International collaboration",
        ],
        challenges:
          "Coordinating a distributed team and iterating on physical design constraints.",
        outcome:
          "3rd place in IREX Global Solutions Challenge and a $1,000 team grant.",
      },
    };
  }

  bindEvents() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector(".mobile-menu-button");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        this.toggleMobileMenu();
      });
    }

    // Navigation links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        this.scrollToSection(targetId);

        // Close mobile menu if open
        if (this.mobileMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });

    // Contact form
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmission(e);
      });

      // Real-time validation
      const formInputs = contactForm.querySelectorAll("input, textarea");
      formInputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input));
        input.addEventListener("input", () => this.clearFieldError(input));
      });
    }

    // Project modal
    const projectDetailButtons = document.querySelectorAll(
      ".project-details-btn"
    );
    projectDetailButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const projectId = e.target.getAttribute("data-project");
        this.openProjectModal(projectId);
      });
    });

    const modal = document.getElementById("project-modal");
    const modalClose = document.querySelector(".modal-close");

    if (modal && modalClose) {
      modalClose.addEventListener("click", () => this.closeProjectModal());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeProjectModal();
        }
      });
    }

    // Scroll events
    window.addEventListener("scroll", this.debouncedScrollHandler, {
      passive: true,
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeProjectModal();
      }
    });

    // Resize events
    window.addEventListener(
      "resize",
      this.debounce(() => {
        if (window.innerWidth > 768 && this.mobileMenuOpen) {
          this.toggleMobileMenu();
        }
      }, 250)
    );

    window.addEventListener("scroll", function () {
      const bg = document.querySelector("#hero > div.absolute");
      if (window.scrollY > 0) {
        bg.classList.add("blurred-bg");
      } else {
        bg.classList.remove("blurred-bg");
      }
    });
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "-10% 0px -10% 0px",
    };

    // Observer for fade-in animations
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Animate skill bars when about section is visible
          if (entry.target.id === "about") {
            this.animateSkillBars();
          }
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll(".fade-in-element");
    fadeElements.forEach((el) => fadeObserver.observe(el));

    // Observer for navigation highlighting
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.updateActiveNavigation(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => navObserver.observe(section));
  }

  setupScrollEffects() {
    // Parallax effect for hero section
    const hero = document.getElementById("hero");
    if (hero) {
      window.addEventListener(
        "scroll",
        () => {
          if (!this.isScrolling) {
            requestAnimationFrame(() => {
              const scrolled = window.pageYOffset;
              const parallaxSpeed = 0.5;
              // Apply parallax only if hero is not blurred
              if (!hero.classList.contains("hero-blurred")) {
                hero.style.transform = `translateY(${
                  scrolled * parallaxSpeed
                }px)`;
              } else {
                // Reset transform when blurred to prevent jitter
                hero.style.transform = "translateY(0)";
              }
              this.isScrolling = false;
            });
            this.isScrolling = true;
          }
        },
        { passive: true }
      );
    }
  }

  setupHeroBlur() {
    // Remove all blur logic to prevent jump
    // const heroSection = document.getElementById("hero");
    // if (!heroSection) return;
    // const heroContent = heroSection.querySelector(".relative.z-10");
    // window.addEventListener(
    //   "scroll",
    //   this.debounce(() => {
    //     const heroHeight = heroSection.offsetHeight;
    //     const scrollPosition = window.scrollY;
    //     if (scrollPosition > heroHeight / 4) {
    //       const blurAmount = Math.min((scrollPosition - heroHeight / 4) / (heroHeight / 2), 1) * 10;
    //       if (heroContent) {
    //         heroContent.style.filter = `blur(${blurAmount}px)`;
    //         heroContent.style.opacity = `${1 - Math.min(blurAmount / 10, 0.7)}`;
    //       }
    //       heroSection.classList.add("hero-blurred");
    //     } else {
    //       if (heroContent) {
    //         heroContent.style.filter = "blur(0px)";
    //         heroContent.style.opacity = "1";
    //       }
    //       heroSection.classList.remove("hero-blurred");
    //     }
    //   }, 10)
    // );
    const heroContent = document.querySelector("#hero .relative.z-10");
    if (heroContent) {
      heroContent.style.filter = "";
      heroContent.style.opacity = "";
    }
  }

  toggleMobileMenu() {
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileMenuButton = document.querySelector(".mobile-menu-button");

    if (mobileMenu && mobileMenuButton) {
      this.mobileMenuOpen = !this.mobileMenuOpen;

      if (this.mobileMenuOpen) {
        mobileMenu.classList.remove("hidden");
        mobileMenuButton.setAttribute("aria-expanded", "true");
        // Animate menu items
        const menuItems = mobileMenu.querySelectorAll("a");
        menuItems.forEach((item, index) => {
          item.style.opacity = "0";
          item.style.transform = "translateY(-10px)";
          setTimeout(() => {
            item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, index * 50);
        });
      } else {
        mobileMenu.classList.add("hidden");
        mobileMenuButton.setAttribute("aria-expanded", "false");
      }
    }
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = document.querySelector("nav").offsetHeight;
      const sectionTop = section.offsetTop - headerHeight;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }
  }

  handleScroll() {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("bg-white/95");
        navbar.classList.remove("bg-white/90");
      } else {
        navbar.classList.add("bg-white/90");
        navbar.classList.remove("bg-white/95");
      }
    }
  }

  updateActiveNavigation(sectionId) {
    if (this.currentSection !== sectionId) {
      this.currentSection = sectionId;

      // Update navigation links
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  }

  animateSkillBars() {
    const skillBars = document.querySelectorAll(".skill-bar");
    skillBars.forEach((bar) => {
      const targetWidth = bar.getAttribute("data-width") + "%";
      bar.style.setProperty("--target-width", targetWidth);
      bar.classList.add("animate");
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = "";

    // Clear previous states
    this.clearFieldError(field);

    switch (fieldName) {
      case "name":
        if (value.length < 2) {
          isValid = false;
          errorMessage = "Name must be at least 2 characters long";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = "Please enter a valid email address";
        }
        break;
      case "subject":
        if (value.length < 5) {
          isValid = false;
          errorMessage = "Subject must be at least 5 characters long";
        }
        break;
      case "message":
        if (value.length < 20) {
          isValid = false;
          errorMessage = "Message must be at least 20 characters long";
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.showFieldSuccess(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add("error");
    field.classList.remove("success");

    const errorElement = field.parentNode.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }
  }

  showFieldSuccess(field) {
    field.classList.add("success");
    field.classList.remove("error");

    const errorElement = field.parentNode.querySelector(".error-message");
    if (errorElement) {
      errorElement.classList.add("hidden");
    }
  }

  clearFieldError(field) {
    field.classList.remove("error");

    const errorElement = field.parentNode.querySelector(".error-message");
    if (errorElement) {
      errorElement.classList.add("hidden");
    }
  }

  async handleFormSubmission(event) {
    const form = event.target;
    const formData = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.querySelector(".button-text");
    const loadingSpinner = button.querySelector(".loading-spinner");
    const messageDiv = document.getElementById("form-message");

    // Validate all fields
    const fields = form.querySelectorAll("input, textarea");
    let isFormValid = true;

    fields.forEach((field) => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showFormMessage("Please fix the errors above", "error");
      return;
    }

    // Show loading state
    button.disabled = true;
    buttonText.classList.add("hidden");
    loadingSpinner.classList.remove("hidden");

    try {
      // Simulate form submission (replace with actual endpoint)
      await this.simulateFormSubmission(formData);

      // Success
      this.showFormMessage(
        "Thank you! Your message has been sent successfully.",
        "success"
      );
      form.reset();

      // Clear field states
      fields.forEach((field) => {
        field.classList.remove("success", "error");
      });
    } catch (error) {
      console.error("Form submission error:", error);
      this.showFormMessage(
        "Sorry, there was an error sending your message. Please try again.",
        "error"
      );
    } finally {
      // Reset button state
      button.disabled = false;
      buttonText.classList.remove("hidden");
      loadingSpinner.classList.add("hidden");
    }
  }

  async simulateFormSubmission(formData) {
    // Simulate network delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error("Network error"));
        }
      }, 2000);
    });
  }

  showFormMessage(message, type) {
    const messageDiv = document.getElementById("form-message");
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `p-4 rounded-lg ${
        type === "success"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`;
      messageDiv.classList.remove("hidden");

      // Auto-hide after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    }
  }

  openProjectModal(projectId) {
    const modal = document.getElementById("project-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");

    const project = this.projectData[projectId];

    if (modal && modalTitle && modalContent && project) {
      modalTitle.textContent = project.title;

      modalContent.innerHTML = `
                <div class="space-y-6">
                    <p class="text-gray-600 leading-relaxed">${
                      project.description
                    }</p>
                    
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h4>
                        <div class="flex flex-wrap gap-2">
                            ${project.technologies
                              .map(
                                (tech) => `
                                <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">${tech}</span>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-3">Key Features</h4>
                        <ul class="space-y-2">
                            ${project.features
                              .map(
                                (feature) => `
                                <li class="flex items-start space-x-2">
                                    <svg class="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-gray-600">${feature}</span>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-3">Challenges & Solutions</h4>
                        <p class="text-gray-600 leading-relaxed">${
                          project.challenges
                        }</p>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-3">Results</h4>
                        <p class="text-gray-600 leading-relaxed">${
                          project.outcome
                        }</p>
                    </div>
                </div>
            `;

      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";

      // Focus management for accessibility
      modalTitle.focus();
    }
  }

  closeProjectModal() {
    const modal = document.getElementById("project-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioApp();
});

// Service Worker Registration for PWA (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Performance monitoring
if ("PerformanceObserver" in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === "navigation") {
        console.log("Navigation Timing:", entry);
      } else if (entry.entryType === "resource") {
        console.log("Resource Timing:", entry);
      }
    });
  });

  observer.observe({ type: "navigation", buffered: true });
  observer.observe({ type: "resource", buffered: true });
}
