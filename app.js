/**
 * MATH FLUENCY — Kuis Kelancaran Berhitung
 * Versi 100% GRATIS & Lengkap:
 * - 4 Operasi Matematika: Perkalian (×), Penjumlahan (+), Pengurangan (−), Pembagian (÷)
 * - Bebas dari Paywall, Verifikasi Akun, & Kunci Pembatasan Fitur
 * - Perhitungan Math Fluency Formula 1 (Kategorikal) & Formula 2 (Waktu Kontinu)
 * - Web Audio API Synthesizer (Bebas file audio eksternal)
 * - Pelacakan Riwayat 30 Permainan & Rekor Pribadi
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. STORAGE ADAPTER (Universal LocalStorage Wrapper)
  // ==========================================================================
  const storage = {
    get(key) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : null;
      } catch (e) {
        return null;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  // Storage Keys
  const KEY_HISTORY = 'kh_game_history_v2';
  const KEY_THEME = 'kh_theme_mode';
  const KEY_SOUND = 'kh_sound_enabled';
  const KEY_BEST_PREFIX = 'kh_best_record_';

  // ==========================================================================
  // 2. WEB AUDIO API SYNTHESIZER
  // ==========================================================================
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = storage.get(KEY_SOUND) !== false; // Default: true
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.08, endFreq = null, gainVal = 0.12) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (endFreq) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration);
        }

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    tap() {
      this.playTone(520, 'sine', 0.04, 780, 0.06);
    }

    correct() {
      // Arpeggio manis 2 nada (C5 -> G5)
      this.playTone(523.25, 'triangle', 0.09, null, 0.12);
      setTimeout(() => {
        this.playTone(783.99, 'triangle', 0.14, null, 0.14);
      }, 70);
    }

    wrong() {
      // Low tone buzz
      this.playTone(210, 'sawtooth', 0.18, 140, 0.10);
    }

    fanfare() {
      // Melodi akhir kuis
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, idx) => {
        setTimeout(() => {
          this.playTone(f, 'triangle', 0.16, null, 0.15);
        }, idx * 90);
      });
    }

    toggle() {
      this.enabled = !this.enabled;
      storage.set(KEY_SOUND, this.enabled);
      return this.enabled;
    }
  }

  const sfx = new SoundFX();

  // ==========================================================================
  // 3. UI SCREEN MANAGEMENT
  // ==========================================================================
  const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result'),
    history: document.getElementById('screen-history')
  };

  function showScreen(name) {
    const updateDOM = () => {
      Object.keys(screens).forEach((key) => {
        screens[key].classList.toggle('active', key === name);
      });
    };

    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(updateDOM);
    } else {
      updateDOM();
    }
  }

  // ==========================================================================
  // 4. THEME & SOUND CONTROLS (Desktop & Mobile Sync)
  // ==========================================================================
  const soundBtns = [
    document.getElementById('btn-sound-desktop'),
    document.getElementById('btn-sound-mobile')
  ];
  const themeBtns = [
    document.getElementById('btn-theme-desktop'),
    document.getElementById('btn-theme-mobile')
  ];

  function updateSoundUI() {
    const icon = sfx.enabled ? '🔊' : '🔇';
    const title = sfx.enabled ? 'Suara Efek: Aktif' : 'Suara Efek: Hening';
    soundBtns.forEach((btn) => {
      if (btn) {
        btn.querySelector('.sound-icon').textContent = icon;
        btn.title = title;
      }
    });
  }

  soundBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        sfx.toggle();
        updateSoundUI();
        sfx.tap();
      });
    }
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    storage.set(KEY_THEME, theme);
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const title = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
    themeBtns.forEach((btn) => {
      if (btn) {
        btn.querySelector('.theme-icon').textContent = icon;
        btn.title = title;
      }
    });
  }

  const savedTheme = storage.get(KEY_THEME) || 'light';
  setTheme(savedTheme);

  themeBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        setTheme(next);
        sfx.tap();
      });
    }
  });

  updateSoundUI();

  // ==========================================================================
  // 5. OPERATION CONFIGURATION (4 Operations)
  // ==========================================================================
  const OP_CONFIG = {
    mul: {
      name: 'Perkalian',
      symbol: '×',
      panelTitle: 'Pilih Tabel Perkalian',
      unitWord: 'tabel'
    },
    add: {
      name: 'Penjumlahan',
      symbol: '+',
      panelTitle: 'Pilih Angka Dasar Penjumlahan',
      unitWord: 'angka'
    },
    sub: {
      name: 'Pengurangan',
      symbol: '−',
      panelTitle: 'Pilih Angka Pengurang',
      unitWord: 'angka'
    },
    div: {
      name: 'Pembagian',
      symbol: '÷',
      panelTitle: 'Pilih Tabel Pembagi',
      unitWord: 'tabel'
    }
  };

  let currentOp = 'mul';
  let difficultyMode = 'standard'; // 'standard' (2-9) | 'challenge' (2-12)
  let selectedTables = [2, 3];
  let selectedDuration = 30;

  function computeAutoDuration(count) {
    if (count <= 2) return 30;
    if (count <= 4) return 60;
    return 120;
  }

  function targetForDuration(d) {
    if (d === 30) return 10;
    if (d === 60) return 20;
    return 40; // 120s
  }

  function refreshDurationDisplay() {
    const count = selectedTables.length;
    selectedDuration = computeAutoDuration(count);

    document.querySelectorAll('#duration-row .duration-pill').forEach((pill) => {
      const d = parseInt(pill.dataset.duration, 10);
      pill.classList.toggle('selected', d === selectedDuration);
    });

    const target = targetForDuration(selectedDuration);
    const unit = OP_CONFIG[currentOp].unitWord;
    document.getElementById('duration-info').textContent =
      `${count} ${unit} dipilih → durasi ${selectedDuration} detik, target minimal ${target} soal. Kurang dari target akan dihitung sebagai salah.`;
  }

  function applyOpSettings() {
    const cfg = OP_CONFIG[currentOp];
    document.getElementById('table-panel-title').textContent = cfg.panelTitle;
    refreshDurationDisplay();
    renderBestRecords();
  }

  // Event Listener: Pemilihan Operasi
  document.getElementById('op-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.op-pill');
    if (!btn) return;
    currentOp = btn.dataset.op;

    document.querySelectorAll('#op-row .op-pill').forEach((p) => {
      p.classList.toggle('selected', p === btn);
      p.setAttribute('aria-checked', p === btn ? 'true' : 'false');
    });

    sfx.tap();
    applyOpSettings();
  });

  // Event Listener: Pemilihan Angka / Tabel
  const tableRow = document.getElementById('table-row');
  tableRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.number-btn');
    if (!btn) return;
    const val = parseInt(btn.dataset.table, 10);
    const isSelected = btn.classList.contains('selected');

    if (isSelected) {
      if (selectedTables.length <= 1) return; // Minimal 1 tabel harus aktif
      selectedTables = selectedTables.filter((v) => v !== val);
      btn.classList.remove('selected');
    } else {
      selectedTables.push(val);
      btn.classList.add('selected');
    }

    sfx.tap();
    refreshDurationDisplay();
  });

  // Select All Buttons Toggle
  const btnSelectAll = document.getElementById('btn-select-all');
  btnSelectAll.addEventListener('click', () => {
    sfx.tap();
    const visibleBtns = Array.from(tableRow.querySelectorAll('.number-btn:not(.hidden)'));
    const allSelected = visibleBtns.every((btn) => btn.classList.contains('selected'));

    if (allSelected) {
      // Sisakan minimal 1 angka pertama
      selectedTables = [parseInt(visibleBtns[0].dataset.table, 10)];
      visibleBtns.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === 0);
      });
      btnSelectAll.textContent = 'Pilih Semua';
    } else {
      selectedTables = visibleBtns.map((btn) => parseInt(btn.dataset.table, 10));
      visibleBtns.forEach((btn) => btn.classList.add('selected'));
      btnSelectAll.textContent = 'Lepas Semua';
    }
    refreshDurationDisplay();
  });

  // Mode Kesulitan: Standar vs Tantangan
  const btnModeStandard = document.getElementById('btn-mode-standard');
  const btnModeChallenge = document.getElementById('btn-mode-challenge');

  function setDifficultyMode(mode) {
    difficultyMode = mode;
    btnModeStandard.classList.toggle('selected', mode === 'standard');
    btnModeChallenge.classList.toggle('selected', mode === 'challenge');

    const challengeBtns = document.querySelectorAll('.challenge-num');
    challengeBtns.forEach((btn) => {
      btn.classList.toggle('hidden', mode === 'standard');
    });

    // Jika mode kembali ke standard, filter angka > 9
    if (mode === 'standard') {
      selectedTables = selectedTables.filter((n) => n <= 9);
      if (selectedTables.length === 0) selectedTables = [2, 3];
      document.querySelectorAll('#table-row .number-btn').forEach((btn) => {
        const val = parseInt(btn.dataset.table, 10);
        btn.classList.toggle('selected', selectedTables.includes(val));
      });
    }

    refreshDurationDisplay();
  }

  btnModeStandard.addEventListener('click', () => {
    sfx.tap();
    setDifficultyMode('standard');
  });

  btnModeChallenge.addEventListener('click', () => {
    sfx.tap();
    setDifficultyMode('challenge');
  });

  // ==========================================================================
  // 6. QUESTION GENERATOR ENGINE
  // ==========================================================================
  let currentA = 0;
  let currentB = 0;
  let currentAnswer = 0;
  let questionStartTime = 0;
  let inputStr = '';

  function generateQuestion() {
    const base = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const maxOther = difficultyMode === 'challenge' ? 12 : 9;
    // Angka sekunder antara 2 s/d maxOther
    const other = 2 + Math.floor(Math.random() * (maxOther - 1));

    switch (currentOp) {
      case 'mul':
        // Perkalian: A × B = P
        if (Math.random() < 0.5) {
          currentA = base;
          currentB = other;
        } else {
          currentA = other;
          currentB = base;
        }
        currentAnswer = currentA * currentB;
        break;

      case 'add':
        // Penjumlahan: A + B = S
        if (Math.random() < 0.5) {
          currentA = base;
          currentB = other;
        } else {
          currentA = other;
          currentB = base;
        }
        currentAnswer = currentA + currentB;
        break;

      case 'sub':
        // Pengurangan: Hasil bulat positif!
        // (base + other) - base = other atau (base + other) - other = base
        const sum = base + other;
        if (Math.random() < 0.5) {
          currentA = sum;
          currentB = base;
          currentAnswer = other;
        } else {
          currentA = sum;
          currentB = other;
          currentAnswer = base;
        }
        break;

      case 'div':
        // Pembagian: Habis dibagi tanpa sisa!
        // (base × other) ÷ base = other atau (base × other) ÷ other = base
        const product = base * other;
        if (Math.random() < 0.5) {
          currentA = product;
          currentB = base;
          currentAnswer = other;
        } else {
          currentA = product;
          currentB = other;
          currentAnswer = base;
        }
        break;
    }

    inputStr = '';
    document.getElementById('num-a').textContent = currentA;
    document.getElementById('num-b').textContent = currentB;
    document.getElementById('op-symbol').textContent = OP_CONFIG[currentOp].symbol;
    document.getElementById('answer-box').innerHTML = '<span class="placeholder-dot">?</span>';
    questionStartTime = performance.now();
  }

  // ==========================================================================
  // 7. GAMEPLAY LOOP & STATE
  // ==========================================================================
  let timeLeft = 0;
  let timerInterval = null;
  let correctCount = 0;
  let totalCount = 0;
  let streakCount = 0;
  let targetQuestionCount = 10;
  let records = [];
  let isInputLocked = false;

  function padZero(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return padZero(m) + ':' + padZero(s);
  }

  function updateHUD() {
    document.getElementById('stat-progress').textContent = `Soal ke-${totalCount + 1} (target: ${targetQuestionCount})`;
    document.getElementById('stat-streak').textContent = `🔥 ${streakCount} streak`;
  }

  function startGame() {
    sfx.init();
    sfx.tap();
    correctCount = 0;
    totalCount = 0;
    streakCount = 0;
    records = [];
    isInputLocked = false;

    timeLeft = selectedDuration;
    targetQuestionCount = targetForDuration(selectedDuration);

    const timerPill = document.getElementById('timer-pill');
    timerPill.classList.remove('warn');
    document.getElementById('timer-text').textContent = formatTime(timeLeft);

    updateHUD();
    generateQuestion();
    showScreen('game');

    clearInterval(timerInterval);
    const startTimestamp = performance.now();
    const durationMs = selectedDuration * 1000;

    timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTimestamp;
      const remainingMs = durationMs - elapsed;
      timeLeft = Math.max(0, remainingMs / 1000);

      if (timeLeft <= 10.05) {
        timerPill.classList.add('warn');
      }

      document.getElementById('timer-text').textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer-text').textContent = formatTime(0);
        endGame();
      }
    }, 100);
  }

  function handleKeyInput(key) {
    if (isInputLocked) return;

    if (key === 'stop') {
      sfx.tap();
      clearInterval(timerInterval);
      endGame();
      return;
    }

    if (key === 'back') {
      sfx.tap();
      inputStr = inputStr.slice(0, -1);
      const answerBox = document.getElementById('answer-box');
      if (inputStr.length > 0) {
        answerBox.textContent = inputStr;
      } else {
        answerBox.innerHTML = '<span class="placeholder-dot">?</span>';
      }
      return;
    }

    // Input digit angka 0-9
    const expectedLen = String(currentAnswer).length;
    if (inputStr.length >= expectedLen) return;

    sfx.tap();
    inputStr += key;
    document.getElementById('answer-box').textContent = inputStr;

    // Trigger haptic vibration jika didukung
    if (navigator.vibrate) {
      try { navigator.vibrate(25); } catch (e) {}
    }

    // Selesaikan jawaban otomatis saat digit terpenuhi
    if (inputStr.length === expectedLen) {
      evaluateAnswer();
    }
  }

  function evaluateAnswer() {
    isInputLocked = true;
    const timeTaken = (performance.now() - questionStartTime) / 1000;
    const userVal = parseInt(inputStr, 10);
    const isCorrect = userVal === currentAnswer;

    records.push({
      a: currentA,
      b: currentB,
      correctAnswer: currentAnswer,
      userAnswer: userVal,
      timeTaken: timeTaken,
      isCorrect: isCorrect,
      op: currentOp
    });

    totalCount++;
    if (isCorrect) {
      correctCount++;
      streakCount++;
      sfx.correct();
    } else {
      streakCount = 0;
      sfx.wrong();
    }

    updateHUD();

    const card = document.getElementById('question-card');
    card.classList.add(isCorrect ? 'flash-correct' : 'flash-wrong');

    setTimeout(() => {
      card.classList.remove('flash-correct', 'flash-wrong');
      if (timeLeft > 0) {
        generateQuestion();
        isInputLocked = false;
      }
    }, 240);
  }

  // Keypad click handlers
  document.getElementById('keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('.key');
    if (!btn) return;
    handleKeyInput(btn.dataset.k);
  });

  // Physical Keyboard Support
  document.addEventListener('keydown', (e) => {
    if (!screens.game.classList.contains('active')) return;
    if (e.key >= '0' && e.key <= '9') {
      handleKeyInput(e.key);
    } else if (e.key === 'Backspace') {
      handleKeyInput('back');
    } else if (e.key === 'Escape') {
      handleKeyInput('stop');
    }
  });

  // ==========================================================================
  // 8. MATH FLUENCY FORMULAS & RESULTS ENGINE
  // ==========================================================================
  function weightForTime(t) {
    if (t < 2.5) return 1.00; // Sangat Lancar / Otomatis
    if (t < 4.0) return 0.75; // Normal
    if (t < 6.0) return 0.40; // Cukup Lambat
    return 0.10;              // Lambat
  }

  function endGame() {
    sfx.fanfare();

    const shortfall = Math.max(0, targetQuestionCount - totalCount);
    const effectiveTotal = totalCount + shortfall; // max(totalCount, targetQuestionCount)

    // Format Deskripsi Skor
    const scoreSummary = document.getElementById('result-score');
    if (shortfall > 0) {
      scoreSummary.textContent = `${correctCount} benar dari ${totalCount} soal dikerjakan · ${shortfall} soal belum terkejar dari target minimal ${targetQuestionCount} (dihitung salah)`;
    } else {
      scoreSummary.textContent = `${correctCount} dari ${totalCount} soal dijawab benar (target minimal ${targetQuestionCount} soal tercapai! 🎉)`;
    }

    // Formula 1: Akurasi × Rata-rata Bobot Kecepatan
    const A = effectiveTotal ? (correctCount / effectiveTotal) * 100 : 0;
    let weightSum = 0;
    records.forEach((r) => {
      if (r.isCorrect) weightSum += weightForTime(r.timeTaken);
    });
    const Wspeed = correctCount ? weightSum / correctCount : 0;
    const F1 = A * Wspeed;

    // Formula 2: Waktu Reaksi Kontinu Logaritmik
    // F2 = (Nbenar / Ntotal) × (1 / Nbenar) × sum[1.5 / max(1.5, t_i)] × 100
    let contSum = 0;
    records.forEach((r) => {
      if (r.isCorrect) contSum += 1.5 / Math.max(1.5, r.timeTaken);
    });
    const contAvg = correctCount ? contSum / correctCount : 0;
    const F2 = effectiveTotal ? (correctCount / effectiveTotal) * contAvg * 100 : 0;

    document.getElementById('fluency-number').textContent = F1.toFixed(2);
    document.getElementById('fluency-number-2').textContent = F2.toFixed(2);

    // Filter Kategori Kecepatan
    const lancar = [];
    const normal = [];
    const cukupLambat = [];
    const lambat = [];
    const salah = [];

    records.forEach((r) => {
      if (r.isCorrect) {
        if (r.timeTaken < 2.5) lancar.push(r);
        else if (r.timeTaken < 4.0) normal.push(r);
        else if (r.timeTaken < 6.0) cukupLambat.push(r);
        else lambat.push(r);
      } else {
        salah.push(r);
      }
    });

    document.getElementById('count-lancar').textContent = lancar.length;
    document.getElementById('count-normal').textContent = normal.length;
    document.getElementById('count-cukup-lambat').textContent = cukupLambat.length;
    document.getElementById('count-lambat').textContent = lambat.length;
    document.getElementById('count-salah').textContent = salah.length + shortfall;

    function renderCategoryItems(containerId, list, isWrong) {
      const el = document.getElementById(containerId);
      if (!list.length) {
        el.innerHTML = '<span class="cat-empty">Tidak ada</span>';
        return;
      }
      el.innerHTML = list.map((r) => {
        const sym = OP_CONFIG[r.op].symbol;
        if (isWrong) {
          const ans = isNaN(r.userAnswer) ? '—' : r.userAnswer;
          return `<div class="cat-item">${r.a} ${sym} ${r.b} = ${ans} ❌ (Jawaban: ${r.correctAnswer})</div>`;
        }
        return `<div class="cat-item">${r.a} ${sym} ${r.b} = ${r.correctAnswer} (${r.timeTaken.toFixed(1)}s)</div>`;
      }).join('');
    }

    renderCategoryItems('cat-lancar', lancar, false);
    renderCategoryItems('cat-normal', normal, false);
    renderCategoryItems('cat-cukup-lambat', cukupLambat, false);
    renderCategoryItems('cat-lambat', lambat, false);

    // Catatan untuk soal salah + shortfall
    const salahContainer = document.getElementById('cat-salah');
    let salahHtml = salah.map((r) => {
      const sym = OP_CONFIG[r.op].symbol;
      const ans = isNaN(r.userAnswer) ? '—' : r.userAnswer;
      return `<div class="cat-item">${r.a} ${sym} ${r.b} = ${ans} ❌ (Jawaban: ${r.correctAnswer})</div>`;
    }).join('');

    if (shortfall > 0) {
      salahHtml += `<div class="cat-item">+ ${shortfall} soal tidak sempat dijawab (di bawah target minimal ${targetQuestionCount})</div>`;
    }
    salahContainer.innerHTML = salahHtml || '<span class="cat-empty">Semua soal benar! Luar biasa! 🎉</span>';

    // Simpan Rekor Terbaik & Riwayat Permainan
    savePersonalBest(currentOp, F1, F2);
    saveGameHistoryEntry({
      date: new Date().toISOString(),
      op: currentOp,
      f1: F1,
      f2: F2,
      correct: correctCount,
      total: totalCount,
      target: targetQuestionCount,
      duration: selectedDuration,
      tables: [...selectedTables].sort((x, y) => x - y)
    });

    renderBestRecords();
    showScreen('result');
  }

  // ==========================================================================
  // 9. HISTORY & BEST RECORDS PERSISTENCE
  // ==========================================================================
  function savePersonalBest(op, f1, f2) {
    const key = KEY_BEST_PREFIX + op;
    const currentBest = storage.get(key) || { f1: 0, f2: 0 };
    let updated = false;

    if (f1 > currentBest.f1) {
      currentBest.f1 = f1;
      updated = true;
    }
    if (f2 > currentBest.f2) {
      currentBest.f2 = f2;
      updated = true;
    }

    if (updated) {
      storage.set(key, currentBest);
    }
  }

  function getPersonalBest(op) {
    return storage.get(KEY_BEST_PREFIX + op) || { f1: 0, f2: 0 };
  }

  function renderBestRecords() {
    // 1. Render Tiles di Companion Panel Desktop
    ['mul', 'add', 'sub', 'div'].forEach((op) => {
      const best = getPersonalBest(op);
      const valEl = document.getElementById(`best-val-${op}`);
      const subEl = document.getElementById(`best-sub-${op}`);
      if (valEl && subEl) {
        if (best.f1 > 0 || best.f2 > 0) {
          valEl.textContent = best.f1.toFixed(1);
          subEl.textContent = `F2: ${best.f2.toFixed(1)}`;
        } else {
          valEl.textContent = '—';
          subEl.textContent = 'Belum ada rekor';
        }
      }
    });

    // 2. Render Banner di Layar Start
    const bestBanner = document.getElementById('best-record');
    const curBest = getPersonalBest(currentOp);
    if (curBest.f1 > 0) {
      bestBanner.textContent = `🏆 Rekor Terbaik (${OP_CONFIG[currentOp].name}) — Formula 1: ${curBest.f1.toFixed(2)} · Formula 2: ${curBest.f2.toFixed(2)}`;
    } else {
      bestBanner.textContent = `Lakukan kuis pertamamu untuk mencetak rekor di sini!`;
    }

    // Render grafik tren di companion panel desktop
    renderDashboardCharts();
  }

  function getGameHistory() {
    return storage.get(KEY_HISTORY) || [];
  }

  function saveGameHistoryEntry(entry) {
    let history = getGameHistory();
    history.push(entry);
    if (history.length > 30) {
      history = history.slice(history.length - 30);
    }
    storage.set(KEY_HISTORY, history);
  }

  function clearAllHistory() {
    storage.set(KEY_HISTORY, []);
    ['mul', 'add', 'sub', 'div'].forEach((op) => {
      storage.remove(KEY_BEST_PREFIX + op);
    });
    renderBestRecords();
    renderHistoryScreen();
  }

  // ==========================================================================
  // 10. SVG CHARTS & HISTORY DASHBOARD RENDERING
  // ==========================================================================
  let historyFilter = 'all';

  function formatDateTime(isoString) {
    try {
      const d = new Date(isoString);
      const day = padZero(d.getDate());
      const month = padZero(d.getMonth() + 1);
      const hours = padZero(d.getHours());
      const mins = padZero(d.getMinutes());
      return `${day}/${month} ${hours}:${mins}`;
    } catch (e) {
      return '';
    }
  }

  function generateSVGChart(dataArr, width = 420, height = 200) {
    if (dataArr.length < 2) {
      return `<div class="chart-empty">Mainkan minimal 2 sesi untuk melihat garis tren perkembangan.</div>`;
    }

    const padL = 32;
    const padR = 14;
    const padT = 16;
    const padB = 24;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;
    const n = dataArr.length;

    const xAt = (i) => padL + (n === 1 ? 0 : (i / (n - 1)) * plotW);
    const yAt = (val) => padT + plotH - (Math.max(0, Math.min(100, val)) / 100) * plotH;

    const pathFor = (key) => {
      return dataArr.map((item, i) => {
        return `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(item[key]).toFixed(1)}`;
      }).join(' ');
    };

    const gridLines = [0, 25, 50, 75, 100].map((v) => {
      const y = yAt(v).toFixed(1);
      return `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
              <text x="6" y="${parseFloat(y) + 4}" font-size="9" fill="currentColor" opacity="0.6">${v}</text>`;
    }).join('');

    const dotsF1 = dataArr.map((item, i) => {
      return `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(item.f1).toFixed(1)}" r="3" fill="#228be6"/>`;
    }).join('');

    const dotsF2 = dataArr.map((item, i) => {
      return `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(item.f2).toFixed(1)}" r="3" fill="#fd7e14"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Grafik Tren Math Fluency">
        ${gridLines}
        <path d="${pathFor('f1')}" fill="none" stroke="#228be6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${pathFor('f2')}" fill="none" stroke="#fd7e14" stroke-width="2.2" stroke-dasharray="5,4" stroke-linecap="round"/>
        ${dotsF1}
        ${dotsF2}
        <text x="${padL}" y="${height - 4}" font-size="9" fill="currentColor" opacity="0.5">Sesi 1</text>
        <text x="${width - padR - 40}" y="${height - 4}" font-size="9" fill="currentColor" opacity="0.5">Sesi ${n}</text>
      </svg>
    `;
  }

  function renderDashboardCharts() {
    const desktopChartContainer = document.getElementById('chart-container-desktop');
    if (desktopChartContainer) {
      const history = getGameHistory();
      desktopChartContainer.innerHTML = generateSVGChart(history, 380, 180);
    }
  }

  function renderHistoryScreen() {
    const fullHistory = getGameHistory();
    const filtered = historyFilter === 'all'
      ? fullHistory
      : fullHistory.filter((item) => item.op === historyFilter);

    // Chart Mobile
    const mobileChartContainer = document.getElementById('chart-container-mobile');
    if (mobileChartContainer) {
      mobileChartContainer.innerHTML = generateSVGChart(filtered, 400, 200);
    }

    // Average Card
    const avgCard = document.getElementById('avg-card-mobile');
    if (filtered.length > 0) {
      let sum1 = 0, sum2 = 0;
      filtered.forEach((it) => {
        sum1 += it.f1;
        sum2 += it.f2;
      });
      document.getElementById('avg-f1-mobile').textContent = (sum1 / filtered.length).toFixed(2);
      document.getElementById('avg-f2-mobile').textContent = (sum2 / filtered.length).toFixed(2);
      avgCard.style.display = '';
    } else {
      avgCard.style.display = 'none';
    }

    // List Items
    const listContainer = document.getElementById('history-list-mobile');
    if (!filtered.length) {
      listContainer.innerHTML = `<div class="chart-empty">Belum ada riwayat permainan pada filter ini.</div>`;
      return;
    }

    const reversed = [...filtered].reverse();
    listContainer.innerHTML = reversed.map((item) => {
      const opInfo = OP_CONFIG[item.op] || { name: item.op, symbol: '•' };
      const tablesStr = (item.tables || []).join(', ');
      return `
        <div class="history-row-item">
          <div class="history-row-head">
            <span class="history-op-badge">${opInfo.symbol} ${opInfo.name}</span>
            <span>${formatDateTime(item.date)} · ${item.duration}s</span>
          </div>
          <div class="history-scores-row">
            <div class="history-score-cell">${item.f1.toFixed(2)} <small>Formula 1</small></div>
            <div class="history-score-cell">${item.f2.toFixed(2)} <small>Formula 2</small></div>
            <div class="history-score-cell">${item.correct}/${item.total} <small>Benar</small></div>
            <div class="history-score-cell" style="margin-left:auto; text-align:right;">
              ${tablesStr} <small>Angka Dipilih</small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter Buttons di Layar Riwayat
  document.getElementById('history-filter-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    historyFilter = btn.dataset.filter;

    document.querySelectorAll('#history-filter-row .filter-pill').forEach((p) => {
      p.classList.toggle('selected', p === btn);
    });

    sfx.tap();
    renderHistoryScreen();
  });

  // Action Buttons Navigation
  document.getElementById('btn-start').addEventListener('click', startGame);

  document.getElementById('btn-again').addEventListener('click', () => {
    sfx.tap();
    showScreen('start');
    renderBestRecords();
  });

  const openHistoryHandler = () => {
    sfx.tap();
    showScreen('history');
    renderHistoryScreen();
  };

  const btnOpenHistory1 = document.getElementById('btn-open-history');
  if (btnOpenHistory1) btnOpenHistory1.addEventListener('click', openHistoryHandler);

  const btnOpenHistory2 = document.getElementById('btn-open-history-2');
  if (btnOpenHistory2) btnOpenHistory2.addEventListener('click', openHistoryHandler);

  document.getElementById('btn-history-back').addEventListener('click', () => {
    sfx.tap();
    showScreen('start');
    renderBestRecords();
  });

  document.getElementById('btn-history-clear').addEventListener('click', () => {
    if (window.confirm('Hapus semua riwayat permainan dan rekor terbaik?')) {
      sfx.wrong();
      clearAllHistory();
    }
  });

  // ==========================================================================
  // 11. INITIALIZATION ON PAGE LOAD
  // ==========================================================================
  applyOpSettings();
  renderBestRecords();

})();
