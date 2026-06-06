/* ============================================================
   CGPA Calculator — Application Logic (Full Feature Set)
   ============================================================ */

(() => {
    'use strict';

    // ---------- Grade Scales ----------
    const GRADE_SCALES = {
        4: {
            max: 4.0,
            grades: [
                { label: 'A+', value: 4.00 },
                { label: 'A',  value: 4.00 },
                { label: 'A-', value: 3.67 },
                { label: 'B+', value: 3.33 },
                { label: 'B',  value: 3.00 },
                { label: 'B-', value: 2.67 },
                { label: 'C+', value: 2.33 },
                { label: 'C',  value: 2.00 },
                { label: 'C-', value: 1.67 },
                { label: 'D+', value: 1.33 },
                { label: 'D',  value: 1.00 },
                { label: 'F',  value: 0.00 },
            ],
            getLabel(val) {
                const v = val.toFixed(2);
                const map = { '4.00':'A','3.67':'A-','3.33':'B+','3.00':'B','2.67':'B-','2.33':'C+','2.00':'C','1.67':'C-','1.33':'D+','1.00':'D','0.00':'F' };
                return map[v] || v;
            },
            getClass(val) {
                if (val >= 3.67) return 'excellent';
                if (val >= 3.00) return 'good';
                if (val >= 2.00) return 'average';
                return 'poor';
            },
            getLetterGrade(gpa) {
                if (gpa >= 3.85) return 'A';
                if (gpa >= 3.50) return 'A-';
                if (gpa >= 3.15) return 'B+';
                if (gpa >= 2.85) return 'B';
                if (gpa >= 2.50) return 'B-';
                if (gpa >= 2.15) return 'C+';
                if (gpa >= 1.85) return 'C';
                if (gpa >= 1.50) return 'C-';
                if (gpa >= 1.15) return 'D+';
                if (gpa >= 0.50) return 'D';
                return 'F';
            },
        },
        5: {
            max: 5.0,
            grades: [
                { label: 'O',   value: 5.00 },
                { label: 'A+',  value: 4.50 },
                { label: 'A',   value: 4.00 },
                { label: 'B+',  value: 3.50 },
                { label: 'B',   value: 3.00 },
                { label: 'C+',  value: 2.50 },
                { label: 'C',   value: 2.00 },
                { label: 'D',   value: 1.50 },
                { label: 'P',   value: 1.00 },
                { label: 'F',   value: 0.00 },
            ],
            getLabel(val) {
                const v = val.toFixed(2);
                const map = { '5.00':'O','4.50':'A+','4.00':'A','3.50':'B+','3.00':'B','2.50':'C+','2.00':'C','1.50':'D','1.00':'P','0.00':'F' };
                return map[v] || v;
            },
            getClass(val) {
                if (val >= 4.00) return 'excellent';
                if (val >= 3.00) return 'good';
                if (val >= 2.00) return 'average';
                return 'poor';
            },
            getLetterGrade(gpa) {
                if (gpa >= 4.75) return 'O';
                if (gpa >= 4.25) return 'A+';
                if (gpa >= 3.75) return 'A';
                if (gpa >= 3.25) return 'B+';
                if (gpa >= 2.75) return 'B';
                if (gpa >= 2.25) return 'C+';
                if (gpa >= 1.75) return 'C';
                if (gpa >= 1.25) return 'D';
                if (gpa >= 0.50) return 'P';
                return 'F';
            },
        },
        10: {
            max: 10.0,
            grades: [
                { label: 'O',   value: 10.0 },
                { label: 'A+',  value: 9.00 },
                { label: 'A',   value: 8.00 },
                { label: 'B+',  value: 7.00 },
                { label: 'B',   value: 6.00 },
                { label: 'C',   value: 5.00 },
                { label: 'D',   value: 4.00 },
                { label: 'F',   value: 0.00 },
            ],
            getLabel(val) {
                const v = val.toFixed(2);
                const map = { '10.00':'O','9.00':'A+','8.00':'A','7.00':'B+','6.00':'B','5.00':'C','4.00':'D','0.00':'F' };
                return map[v] || v;
            },
            getClass(val) {
                if (val >= 8.00) return 'excellent';
                if (val >= 6.00) return 'good';
                if (val >= 4.00) return 'average';
                return 'poor';
            },
            getLetterGrade(gpa) {
                if (gpa >= 9.50) return 'O';
                if (gpa >= 8.50) return 'A+';
                if (gpa >= 7.50) return 'A';
                if (gpa >= 6.50) return 'B+';
                if (gpa >= 5.50) return 'B';
                if (gpa >= 4.50) return 'C';
                if (gpa >= 3.50) return 'D';
                return 'F';
            },
        },
    };

    const RING_CIRCUMFERENCE = 2 * Math.PI * 85;
    const STORAGE_KEY = 'cgpa_calculator_v2';

    // ---------- State ----------
    let state = {
        semesters: { 1: [] },
        activeSemester: 1,
        semesterCount: 1,
        scale: 4,
        theme: 'dark',
    };

    // ---------- DOM Elements ----------
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const courseForm = $('#course-form');
    const courseNameInput = $('#course-name');
    const creditInput = $('#credit-hours');
    const gradeSelect = $('#grade-select');
    const coursesTable = $('#courses-table');
    const coursesTbody = $('#courses-tbody');
    const emptyState = $('#empty-state');
    const ringProgress = $('#ring-progress');
    const gpaNumber = $('#gpa-number');
    const gpaLetter = $('#gpa-letter');
    const totalCredits = $('#total-credits');
    const totalCourses = $('#total-courses');
    const totalPoints = $('#total-points');
    const highestGpa = $('#highest-gpa');
    const cgpaValue = $('#cgpa-value');
    const cgpaDetail = $('#cgpa-detail');
    const semesterTabs = $('#semester-tabs');
    const btnAddSemester = $('#btn-add-semester');
    const btnClearAll = $('#btn-clear-all');
    const btnDeleteSemester = $('#btn-delete-semester');
    const toastContainer = $('#toast-container');
    const courseCountBadge = $('#course-count-badge');

    // Theme & Export
    const btnThemeToggle = $('#btn-theme-toggle');
    const btnExport = $('#btn-export');
    const exportModal = $('#export-modal');
    const btnCloseModal = $('#btn-close-modal');

    // Charts
    const gradeChart = $('#grade-chart');
    const semesterComparison = $('#semester-comparison');

    // Predictor
    const targetCgpaInput = $('#target-cgpa');
    const targetCreditsInput = $('#target-credits');
    const btnPredict = $('#btn-predict');
    const predictorResult = $('#predictor-result');
    const predictorResultContent = $('#predictor-result-content');

    // Scale buttons
    const scaleButtons = $$('.scale-btn');

    // Particles
    const particlesCanvas = $('#particles-canvas');

    // ---------- Particles System ----------
    function initParticles() {
        if (!particlesCanvas) return;
        const ctx = particlesCanvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resize() {
            particlesCanvas.width = window.innerWidth;
            particlesCanvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * particlesCanvas.width,
                y: Math.random() * particlesCanvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                hue: Math.random() * 60 + 240,  // Purple-blue range
            };
        }

        function initArray() {
            const count = Math.min(Math.floor((particlesCanvas.width * particlesCanvas.height) / 15000), 80);
            particles = Array.from({ length: count }, createParticle);
        }

        function draw() {
            ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = particlesCanvas.width;
                if (p.x > particlesCanvas.width) p.x = 0;
                if (p.y < 0) p.y = particlesCanvas.height;
                if (p.y > particlesCanvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
                ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `hsla(260, 60%, 65%, ${0.08 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animFrame = requestAnimationFrame(draw);
        }

        resize();
        initArray();
        draw();

        window.addEventListener('resize', () => {
            resize();
            initArray();
        });
    }

    // ---------- Local Storage ----------
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* silent */ }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.semesters) {
                    state = { ...state, ...parsed };
                }
            }
        } catch (e) { /* silent */ }
    }

    // ---------- Theme ----------
    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        saveState();
    }

    function toggleTheme() {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        showToast(newTheme === 'dark' ? '🌙' : '☀️', `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode`, 'info');
    }

    // ---------- Scale ----------
    function applyScale(scale) {
        state.scale = scale;
        
        // Update scale buttons
        scaleButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.scale) === scale);
        });

        // Update target CGPA max
        if (targetCgpaInput) {
            targetCgpaInput.max = GRADE_SCALES[scale].max;
            targetCgpaInput.placeholder = `e.g. ${(GRADE_SCALES[scale].max * 0.85).toFixed(2)}`;
        }

        // Populate grade dropdown
        populateGradeDropdown();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        saveState();
    }

    function populateGradeDropdown() {
        const scale = GRADE_SCALES[state.scale];
        gradeSelect.innerHTML = '<option value="" disabled selected>Select grade</option>';
        scale.grades.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.value.toFixed(2);
            opt.textContent = `${g.label.padEnd(4)} (${g.value.toFixed(2)})`;
            gradeSelect.appendChild(opt);
        });
    }

    // ---------- Semester Management ----------
    function renderTabs() {
        const existingTabs = semesterTabs.querySelectorAll('.tab');
        existingTabs.forEach(t => t.remove());

        const semesters = Object.keys(state.semesters).map(Number).sort((a, b) => a - b);

        semesters.forEach(num => {
            const btn = document.createElement('button');
            btn.className = 'tab' + (num === state.activeSemester ? ' active' : '');
            btn.dataset.semester = num;
            btn.id = `tab-sem-${num}`;

            // Calculate GPA for this semester
            const courses = state.semesters[num] || [];
            let gpa = '—';
            if (courses.length > 0) {
                let credits = 0, points = 0;
                courses.forEach(c => { credits += c.credits; points += c.credits * c.grade; });
                gpa = (credits > 0 ? points / credits : 0).toFixed(2);
            }

            btn.innerHTML = `
                <span class="tab-text">Semester ${num}</span>
                <span class="tab-gpa" id="tab-gpa-${num}">${gpa}</span>
            `;
            btn.addEventListener('click', () => switchSemester(num));
            semesterTabs.insertBefore(btn, btnAddSemester);
        });
    }

    function addSemester() {
        state.semesterCount++;
        const newNum = state.semesterCount;
        state.semesters[newNum] = [];
        state.activeSemester = newNum;
        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        saveState();
        showToast('📘', `Semester ${newNum} added`, 'info');
    }

    function deleteSemester() {
        const keys = Object.keys(state.semesters).map(Number);
        if (keys.length <= 1) {
            showToast('⚠️', 'Cannot delete the last semester', 'error');
            return;
        }

        const current = state.activeSemester;
        delete state.semesters[current];

        const remaining = Object.keys(state.semesters).map(Number).sort((a, b) => a - b);
        state.activeSemester = remaining[0];

        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        saveState();
        showToast('🗑️', `Semester ${current} deleted`, 'error');
    }

    function switchSemester(num) {
        state.activeSemester = num;
        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        saveState();
    }

    // ---------- Course Management ----------
    function addCourse(name, credits, gradeValue) {
        const course = {
            id: Date.now() + Math.random(),
            name: name.trim(),
            credits: parseFloat(credits),
            grade: parseFloat(gradeValue),
        };

        if (!state.semesters[state.activeSemester]) {
            state.semesters[state.activeSemester] = [];
        }

        state.semesters[state.activeSemester].push(course);
        saveState();
        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        showToast('✅', `${course.name} added`, 'success');
    }

    function removeCourse(courseId) {
        const sem = state.semesters[state.activeSemester];
        if (!sem) return;

        const row = document.querySelector(`tr[data-id="${courseId}"]`);
        if (row) {
            row.classList.add('row-removing');
            row.addEventListener('animationend', () => {
                state.semesters[state.activeSemester] = sem.filter(c => c.id !== courseId);
                saveState();
                renderTabs();
                renderCourses();
                updateResults();
                renderGradeChart();
                renderSemesterComparison();
            });
        } else {
            state.semesters[state.activeSemester] = sem.filter(c => c.id !== courseId);
            saveState();
            renderTabs();
            renderCourses();
            updateResults();
            renderGradeChart();
            renderSemesterComparison();
        }
    }

    function clearAll() {
        if (!state.semesters[state.activeSemester]?.length) return;
        state.semesters[state.activeSemester] = [];
        saveState();
        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        showToast('🗑️', 'All courses cleared', 'error');
    }

    // ---------- Rendering ----------
    function renderCourses() {
        const courses = state.semesters[state.activeSemester] || [];
        coursesTbody.innerHTML = '';
        courseCountBadge.textContent = courses.length;

        if (courses.length === 0) {
            coursesTable.classList.remove('visible');
            emptyState.classList.remove('hidden');
            return;
        }

        coursesTable.classList.add('visible');
        emptyState.classList.add('hidden');

        const scale = GRADE_SCALES[state.scale];

        courses.forEach((course, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = course.id;
            tr.style.animationDelay = `${index * 0.05}s`;

            const gradeLabel = scale.getLabel(course.grade);
            const gradeClass = scale.getClass(course.grade);
            const points = (course.credits * course.grade).toFixed(2);

            tr.innerHTML = `
                <td style="color: var(--text-tertiary); font-size: 0.78rem; font-weight: 600;">${index + 1}</td>
                <td class="course-name-cell">${escapeHtml(course.name)}</td>
                <td>${course.credits}</td>
                <td><span class="grade-badge ${gradeClass}">${gradeLabel}</span></td>
                <td>${points}</td>
                <td>
                    <button class="btn-icon" title="Remove course" data-remove="${course.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                    </button>
                </td>
            `;

            coursesTbody.appendChild(tr);
        });
    }

    // ---------- Results ----------
    function updateResults() {
        const courses = state.semesters[state.activeSemester] || [];
        const scale = GRADE_SCALES[state.scale];

        // Semester GPA
        let semCredits = 0, semPoints = 0;
        courses.forEach(c => {
            semCredits += c.credits;
            semPoints += c.credits * c.grade;
        });

        const semGPA = semCredits > 0 ? semPoints / semCredits : 0;

        // Animate GPA number
        animateValue(gpaNumber, parseFloat(gpaNumber.textContent), semGPA, 600);

        // Letter grade
        gpaLetter.textContent = courses.length > 0 ? scale.getLetterGrade(semGPA) : '—';

        // Stats
        totalCredits.textContent = semCredits;
        totalCourses.textContent = courses.length;
        totalPoints.textContent = semPoints.toFixed(2);

        // Ring
        const progress = semGPA / scale.max;
        const offset = RING_CIRCUMFERENCE * (1 - progress);
        ringProgress.style.strokeDashoffset = offset;

        // CGPA
        let allCredits = 0, allPoints = 0, semCount = 0;
        let bestGPA = 0, bestSem = '';

        Object.entries(state.semesters).forEach(([num, sem]) => {
            if (sem.length > 0) {
                semCount++;
                let sc = 0, sp = 0;
                sem.forEach(c => {
                    allCredits += c.credits;
                    allPoints += c.credits * c.grade;
                    sc += c.credits;
                    sp += c.credits * c.grade;
                });
                const gpa = sc > 0 ? sp / sc : 0;
                if (gpa > bestGPA) {
                    bestGPA = gpa;
                    bestSem = `Sem ${num}`;
                }
            }
        });

        const cgpa = allCredits > 0 ? allPoints / allCredits : 0;
        animateValue(cgpaValue, parseFloat(cgpaValue.textContent), cgpa, 600);

        cgpaDetail.textContent = semCount > 1
            ? `Across ${semCount} semesters · ${allCredits} credits`
            : 'Across all semesters';

        // Best semester
        highestGpa.textContent = semCount > 0 ? `${bestGPA.toFixed(2)}` : '—';
        if (highestGpa.nextElementSibling) {
            highestGpa.closest('.stat-content').querySelector('.stat-label').textContent =
                bestSem ? `Best (${bestSem})` : 'Best Semester';
        }
    }

    // ---------- Grade Distribution Chart ----------
    function renderGradeChart() {
        const courses = state.semesters[state.activeSemester] || [];
        const scale = GRADE_SCALES[state.scale];

        if (courses.length === 0) {
            gradeChart.innerHTML = '<div class="chart-empty">Add courses to see grade distribution</div>';
            return;
        }

        // Count grades by class
        const counts = { excellent: 0, good: 0, average: 0, poor: 0 };
        const labels = { excellent: 'A / A+', good: 'B / B+', average: 'C / C+', poor: 'D / F' };

        courses.forEach(c => {
            const cls = scale.getClass(c.grade);
            counts[cls]++;
        });

        const maxCount = Math.max(...Object.values(counts), 1);

        let html = '<div class="grade-bars">';
        ['excellent', 'good', 'average', 'poor'].forEach(key => {
            const pct = (counts[key] / maxCount) * 100;
            html += `
                <div class="grade-bar-row">
                    <span class="grade-bar-label">${labels[key]}</span>
                    <div class="grade-bar-track">
                        <div class="grade-bar-fill ${key}" style="width: ${pct}%"></div>
                    </div>
                    <span class="grade-bar-count">${counts[key]}</span>
                </div>
            `;
        });
        html += '</div>';
        gradeChart.innerHTML = html;

        // Animate bars
        requestAnimationFrame(() => {
            gradeChart.querySelectorAll('.grade-bar-fill').forEach(bar => {
                const w = bar.style.width;
                bar.style.width = '0';
                requestAnimationFrame(() => { bar.style.width = w; });
            });
        });
    }

    // ---------- Semester Comparison Chart ----------
    function renderSemesterComparison() {
        const semesters = Object.keys(state.semesters).map(Number).sort((a, b) => a - b);
        const scale = GRADE_SCALES[state.scale];

        const semGPAs = [];
        semesters.forEach(num => {
            const courses = state.semesters[num] || [];
            if (courses.length > 0) {
                let credits = 0, points = 0;
                courses.forEach(c => { credits += c.credits; points += c.credits * c.grade; });
                semGPAs.push({ num, gpa: credits > 0 ? points / credits : 0 });
            }
        });

        if (semGPAs.length < 1) {
            semesterComparison.innerHTML = '<div class="chart-empty">Add courses to multiple semesters to compare</div>';
            return;
        }

        const maxGPA = scale.max;

        let html = '<div class="semester-bars">';
        semGPAs.forEach(s => {
            const heightPct = (s.gpa / maxGPA) * 100;
            const isActive = s.num === state.activeSemester;
            html += `
                <div class="semester-bar-item ${isActive ? 'active' : ''}">
                    <span class="semester-bar-gpa">${s.gpa.toFixed(2)}</span>
                    <div class="semester-bar" style="height: ${heightPct}%" title="Semester ${s.num}: ${s.gpa.toFixed(2)}"></div>
                    <span class="semester-bar-label">Sem ${s.num}</span>
                </div>
            `;
        });
        html += '</div>';
        semesterComparison.innerHTML = html;

        // Animate bars
        requestAnimationFrame(() => {
            semesterComparison.querySelectorAll('.semester-bar').forEach(bar => {
                const h = bar.style.height;
                bar.style.height = '0';
                requestAnimationFrame(() => { bar.style.height = h; });
            });
        });
    }

    // ---------- Target CGPA Predictor ----------
    function predict() {
        const targetCGPA = parseFloat(targetCgpaInput.value);
        const nextCredits = parseFloat(targetCreditsInput.value);
        const scale = GRADE_SCALES[state.scale];

        if (!targetCGPA || !nextCredits) {
            showToast('⚠️', 'Please fill in both fields', 'error');
            return;
        }

        if (targetCGPA > scale.max) {
            showToast('⚠️', `Target CGPA cannot exceed ${scale.max.toFixed(1)}`, 'error');
            return;
        }

        // Calculate current totals
        let allCredits = 0, allPoints = 0;
        Object.values(state.semesters).forEach(sem => {
            sem.forEach(c => {
                allCredits += c.credits;
                allPoints += c.credits * c.grade;
            });
        });

        if (allCredits === 0) {
            predictorResult.classList.remove('hidden');
            predictorResultContent.innerHTML = `
                <span class="result-warning">⚠️ No courses added yet.</span>
                <span class="result-label">Add some courses first to use the predictor.</span>
            `;
            return;
        }

        const totalCredits = allCredits + nextCredits;
        const requiredPoints = targetCGPA * totalCredits;
        const neededPoints = requiredPoints - allPoints;
        const requiredGPA = neededPoints / nextCredits;

        predictorResult.classList.remove('hidden');

        if (requiredGPA <= 0) {
            predictorResultContent.innerHTML = `
                <span class="result-success">🎉 You've already achieved your target!</span>
                <span class="result-label">Your current CGPA is above ${targetCGPA.toFixed(2)}</span>
            `;
        } else if (requiredGPA > scale.max) {
            predictorResultContent.innerHTML = `
                <span class="result-error">❌ Not achievable with ${nextCredits} credits</span>
                <span class="result-label">You'd need a GPA of <strong>${requiredGPA.toFixed(2)}</strong>, which exceeds the ${scale.max.toFixed(1)} scale. Try more credits or adjust your target.</span>
            `;
        } else {
            const difficulty = requiredGPA / scale.max;
            let diffLabel, diffClass;
            if (difficulty <= 0.6) { diffLabel = 'Easily achievable! 🎯'; diffClass = 'result-success'; }
            else if (difficulty <= 0.8) { diffLabel = 'Challenging but doable 💪'; diffClass = 'result-warning'; }
            else { diffLabel = 'Very challenging 🔥'; diffClass = 'result-error'; }

            predictorResultContent.innerHTML = `
                <div style="text-align: center;">
                    <span class="result-label">Required GPA next semester</span>
                    <div class="result-gpa">${requiredGPA.toFixed(2)}</div>
                    <span class="${diffClass}" style="font-weight: 600;">${diffLabel}</span>
                </div>
            `;
        }
    }

    // ---------- Export ----------
    function openExportModal() {
        exportModal.classList.remove('hidden');
    }

    function closeExportModal() {
        exportModal.classList.add('hidden');
    }

    function exportAsText() {
        const scale = GRADE_SCALES[state.scale];
        let text = `CGPA Calculator Report\n${'='.repeat(40)}\nGPA Scale: ${scale.max}.0\n\n`;

        const semesters = Object.keys(state.semesters).map(Number).sort((a, b) => a - b);

        let allCredits = 0, allPoints = 0;

        semesters.forEach(num => {
            const courses = state.semesters[num];
            if (courses.length === 0) return;

            text += `\nSemester ${num}\n${'-'.repeat(30)}\n`;
            let semCredits = 0, semPoints = 0;

            courses.forEach((c, i) => {
                const pts = c.credits * c.grade;
                semCredits += c.credits;
                semPoints += pts;
                allCredits += c.credits;
                allPoints += pts;
                text += `${(i + 1).toString().padStart(2)}. ${c.name.padEnd(25)} Credits: ${c.credits}  Grade: ${scale.getLabel(c.grade).padEnd(3)}  Points: ${pts.toFixed(2)}\n`;
            });

            const gpa = semCredits > 0 ? semPoints / semCredits : 0;
            text += `\n   Semester GPA: ${gpa.toFixed(2)} | Credits: ${semCredits} | Points: ${semPoints.toFixed(2)}\n`;
        });

        const cgpa = allCredits > 0 ? allPoints / allCredits : 0;
        text += `\n${'='.repeat(40)}\nCumulative GPA: ${cgpa.toFixed(2)}\nTotal Credits: ${allCredits}\nTotal Grade Points: ${allPoints.toFixed(2)}\n`;

        navigator.clipboard.writeText(text).then(() => {
            showToast('📋', 'Results copied to clipboard', 'success');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('📋', 'Results copied to clipboard', 'success');
        });
        closeExportModal();
    }

    function exportAsCSV() {
        const scale = GRADE_SCALES[state.scale];
        let csv = 'Semester,Course Name,Credits,Grade,Grade Points\n';

        Object.entries(state.semesters).forEach(([num, courses]) => {
            courses.forEach(c => {
                csv += `${num},"${c.name}",${c.credits},${scale.getLabel(c.grade)},${(c.credits * c.grade).toFixed(2)}\n`;
            });
        });

        downloadFile(csv, 'cgpa_report.csv', 'text/csv');
        closeExportModal();
        showToast('📊', 'CSV downloaded', 'success');
    }

    function exportAsJSON() {
        const json = JSON.stringify(state, null, 2);
        downloadFile(json, 'cgpa_data.json', 'application/json');
        closeExportModal();
        showToast('💾', 'JSON data downloaded', 'success');
    }

    function exportPrint() {
        closeExportModal();
        setTimeout(() => window.print(), 300);
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ---------- Utility ----------
    function animateValue(el, start, end, duration) {
        if (isNaN(start)) start = 0;
        if (isNaN(end)) end = 0;
        const startTime = performance.now();
        const diff = end - start;

        function tick(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = start + diff * eased;
            el.textContent = current.toFixed(2);
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(icon, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, 2500);
    }

    // ---------- Event Listeners ----------
    // Form submit
    courseForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = courseNameInput.value.trim();
        const credits = creditInput.value;
        const grade = gradeSelect.value;

        if (!name || !credits || !grade) {
            showToast('⚠️', 'Please fill all fields', 'error');
            return;
        }

        addCourse(name, credits, grade);

        courseNameInput.value = '';
        creditInput.value = '';
        gradeSelect.value = '';
        courseNameInput.focus();
    });

    // Remove course (event delegation)
    coursesTbody.addEventListener('click', e => {
        const btn = e.target.closest('[data-remove]');
        if (btn) {
            const id = parseFloat(btn.dataset.remove);
            removeCourse(id);
        }
    });

    // Semester
    btnAddSemester.addEventListener('click', addSemester);
    btnClearAll.addEventListener('click', clearAll);
    btnDeleteSemester.addEventListener('click', deleteSemester);

    // Theme
    btnThemeToggle.addEventListener('click', toggleTheme);

    // Scale
    scaleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const scale = parseInt(btn.dataset.scale);
            applyScale(scale);
            showToast('📐', `Switched to ${scale}.0 scale`, 'info');
        });
    });

    // Export
    btnExport.addEventListener('click', openExportModal);
    btnCloseModal.addEventListener('click', closeExportModal);
    exportModal.addEventListener('click', e => {
        if (e.target === exportModal) closeExportModal();
    });

    $('#export-text').addEventListener('click', exportAsText);
    $('#export-csv').addEventListener('click', exportAsCSV);
    $('#export-json').addEventListener('click', exportAsJSON);
    $('#export-print').addEventListener('click', exportPrint);

    // Predictor
    btnPredict.addEventListener('click', predict);
    targetCgpaInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); predict(); }
    });
    targetCreditsInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); predict(); }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        // Ctrl+N — New semester
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            addSemester();
        }
        // Ctrl+T — Theme toggle
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
        // Ctrl+E — Export
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            openExportModal();
        }
        // Escape — Close modal
        if (e.key === 'Escape') {
            closeExportModal();
        }
    });

    // ---------- Init ----------
    function init() {
        loadState();
        applyTheme(state.theme);
        applyScale(state.scale);
        renderTabs();
        renderCourses();
        updateResults();
        renderGradeChart();
        renderSemesterComparison();
        initParticles();
    }

    init();
})();
