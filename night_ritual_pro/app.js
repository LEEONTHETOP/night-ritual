(function () {
  /* DOM 简写 */
  const g = id => document.getElementById(id);
  const q = sel => document.querySelectorAll(sel);

  const show = id => toggle(id, true);
  const hide = id => toggle(id, false);
  const toggle = (id, on) => {
    const el = g(id);
    el.style.display = on ? "flex" : "none";
    setTimeout(() => el.classList.toggle("active", on), 10);
  };

  /* 连续早睡 */
  let streak = +localStorage.getItem("streak") || 0;
  g("streak").textContent = streak;

  /* ============ CLOCK & THEME ============ */
  const clockEl = g("clock");
  refreshClock();
  setInterval(refreshClock, 1000);

  function refreshClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  autoTheme(now.getHours());      // 仍然负责昼夜主题
  setBackground(now.getHours());  // ★ 每秒刷新背景（传入当前小时）
}


  function autoTheme(hr) {
    const desiredLight = hr >= 6 && hr < 18;
    const isLight = document.body.classList.contains("light");
    if (desiredLight !== isLight) toggleTheme();
  }

  g("themeToggle").onclick = toggleTheme;
  function toggleTheme() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    setBackground(); // 更新背景图
  }

  /* ============ BACKGROUND & STARS ============ */
  function setBackground(hr = new Date().getHours()) {
  /* --------- 你可以自定义的 5 个时段 ---------
     0–5   深夜星空
     6–11  轻晨日出
     12–17 正午晴空
     18–20 晚霞
     21–23 月夜
  -------------------------------------------- */

  let bg;
  if (hr >= 0 && hr < 6) {
    bg = "linear-gradient(135deg,#000428 0%,#004e92 100%)";        // 深夜纯渐变
  } else if (hr < 12) {
    bg = "url(https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1500&q=80)"; // 清晨
  } else if (hr < 18) {
    bg = "url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1500&q=80)"; // 白天
  } else if (hr < 21) {
    bg = "url(https://images.unsplash.com/photo-1501973801540-537f08c57f6e?w=1500&q=80)"; // 晚霞
  } else {
    bg = "linear-gradient(135deg,#0f2027 0%,#203a43 40%,#2c5364 100%)"; // 月夜渐变
  }

  /* 解决缓存：给图片加时间戳（只对 URL 生效）*/
  if (bg.startsWith("url(")) {
    const noCache = `${bg.slice(0, -1)}&t=${Date.now()})`;
    g("bg").style.backgroundImage = noCache;
  } else {
    g("bg").style.backgroundImage = bg; // 纯渐变
  }
}



  function initStars() {
    const c = g("stars"), w = innerWidth, h = innerHeight;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5,
      a: Math.random(),
      v: Math.random() * 0.02
    }));
    (function draw() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.a += s.v;
        if (s.a > 1) {
          s.a = 0;
          s.x = Math.random() * w;
          s.y = Math.random() * h;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  /* ============ Guided Flow ============ */
  g("tutorial-ok").onclick = () => hide("tutorial-overlay");

  g("exitBtn").onclick = () => show("modal-first");

  /* 多层关怀 */
  let refuse = 0;

  g("btn-care-yes").onclick = () => {
    hide("modal-first");
    show("modal-reason");
  };
  g("btn-care-no").onclick = () => {
    refuse++;
    hide("modal-first");
    if (refuse === 1) show("modal-second");
    else if (refuse >= 2) forceBreath();
  };

  g("care2-yes").onclick = () => {
    hide("modal-second");
    show("modal-reason");
  };
  g("care2-no").onclick = () => {
    refuse++;
    hide("modal-second");
    if (refuse >= 2) forceBreath();
  };

  function forceBreath() {
    alert("连续熬夜对身体危害大！立即进行 5 秒呼吸放松～");
    startBreath();
    refuse = 0;
  }

  /* 理由 */
  q(".reason-btn").forEach(b => (b.onclick = startBreath));
  g("reason-skip").onclick = startBreath;

  /* 呼吸倒计时 */
  function startBreath() {
    hide("modal-reason");
    show("modal-breath");
    let c = 5;
    g("countdownNum").textContent = c;
    const iv = setInterval(() => {
      c--;
      g("countdownNum").textContent = c;
      if (c === 0) {
        clearInterval(iv);
        hide("modal-breath");
        beginSleep();
      }
    }, 1000);
  }

  /* 睡眠计时 */
  const wakeBtn = g("wakeBtn");
  if (localStorage.getItem("sleepStart")) wakeBtn.style.display = "block";

  function beginSleep() {
    localStorage.setItem("sleepStart", Date.now());
    wakeBtn.style.display = "block";
  }

  wakeBtn.onclick = endSleep;

  function endSleep() {
    const start = +localStorage.getItem("sleepStart");
    if (!start) return;
    const durHrs = +((Date.now() - start) / 3600000).toFixed(1);
    localStorage.removeItem("sleepStart");
    wakeBtn.style.display = "none";

    streak++;
    localStorage.setItem("streak", streak);
    g("streak").textContent = streak;

    saveHistory("sleep", { date: today(), hrs: durHrs });

    g("sleepInfo").textContent = `你睡了 ${durHrs} 小时，真棒！🌅`;
    show("modal-morning");
  }

  g("morning-ok").onclick = () => hide("modal-morning");

  /* ======= Mood ======= */
  let selMood = "😊";
  g("moodBtn").onclick = () => show("modal-mood");
  g("closeMood").onclick = () => hide("modal-mood");

  q(".mood-btn").forEach(btn => {
    btn.onclick = () => {
      q(".mood-btn").forEach(b => b.classList.remove("selected"));
      selMood = btn.dataset.mood;
      btn.classList.add("selected");
    };
  });

  g("saveMood").onclick = () => {
    saveHistory("mood", {
      date: today(),
      mood: selMood,
      note: g("moodNote").value.trim()
    });
    g("moodNote").value = "";
    hide("modal-mood");
    alert("心情已记录 🎈");
  };

  /* ======= Stats ======= */
  g("viewStats").onclick = () => {
    renderChart();
    show("modal-stats");
  };
  g("closeStats").onclick = () => hide("modal-stats");

  function renderChart() {
    if (!window.Chart) return;
    const ctx = g("statsChart").getContext("2d");
    if (window.myChart) window.myChart.destroy();

    const sleeps = getHist("sleep");
    const moods = getHist("mood");
    const days = [...new Set([...sleeps, ...moods].map(x => x.date))].slice(-7);

    const sleepArr = days.map(d => (sleeps.find(s => s.date === d) || {}).hrs || 0);
    const moodArr = days.map(d => {
      const m = moods.find(x => x.date === d);
      return m ? moodScore(m.mood) : null;
    });

    window.myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: days,
        datasets: [
          { label: "睡眠(小时)", data: sleepArr, backgroundColor: "rgba(136,255,255,.45)" },
          { type: "line", label: "心情(1-5)", data: moodArr, yAxisID: "y2", borderColor: "#ff9", backgroundColor: "rgba(255,255,150,.25)", tension: 0.35 }
        ]
      },
      options: {
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "睡眠小时" } },
          y2: { position: "right", min: 1, max: 5, ticks: { stepSize: 1 }, grid: { drawOnChartArea: false }, title: { display: true, text: "心情" } }
        }
      }
    });
  }

  /* ======= History Pane ======= */
  g("viewHistory").onclick = () => {
    const list = g("historyList");
    const sleeps = getHist("sleep").map(s => `【${s.date}】睡眠 ${s.hrs}h`);
    const moods = getHist("mood").map(m => `【${m.date}】心情 ${m.mood}${m.note ? " - " + m.note : ""}`);
    list.innerHTML = [...sleeps, ...moods].sort().reverse().join("<br>");
    show("modal-history");
  };
  g("closeHistory").onclick = () => hide("modal-history");

  /* ======= Storage Helpers ======= */
  function saveHistory(type, obj) {
    const key = "hist-" + type;
    const arr = getHist(type).filter(x => x.date !== obj.date);
    arr.push(obj);
    localStorage.setItem(key, JSON.stringify(arr));
  }
  function getHist(type) {
    return JSON.parse(localStorage.getItem("hist-" + type) || "[]");
  }
  const today = () => new Date().toLocaleDateString();
  const moodScore = m => ({ "😢": 1, "😟": 2, "🙂": 3, "😌": 4, "😊": 5 }[m] || 3);
})();
