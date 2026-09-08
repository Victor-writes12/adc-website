// ADC Training Portal — student dashboard logic
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "ST";
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function formatDate(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return d; }
  }

  function youtubeId(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  ready(function () {
    if (!window.ADCPortal) return;
    var client = window.ADCPortal.client;
    var currentStudent = null;

    document.getElementById("logoutLink").addEventListener("click", function (e) {
      e.preventDefault();
      window.ADCPortal.signOut().then(function () { window.location.href = "login.html"; });
    });

    window.ADCPortal.requireSession().then(function (session) {
      var user = session.user;
      return window.ADCPortal.getStudentProfile(user.id).then(function (profile) {
        if (!profile) {
          window.location.href = "complete-profile.html";
          return;
        }
        currentStudent = profile;
        renderProfile(profile);
        loadResources();
        loadTasks(profile);
        if (profile.is_admin) {
          document.getElementById("adminPanel").style.display = "block";
          wireAdminForms();
          loadAdminLists();
        }
      });
    }).catch(function () { /* requireSession already redirected */ });

    function renderProfile(p) {
      var firstName = (p.full_name || "").trim().split(/\s+/)[0] || "there";
      document.getElementById("welcomeName").textContent = "Welcome back, " + firstName + "!";
      document.getElementById("welcomeSub").textContent = "Here's where you left off in the ADC Systems Training Bootcamp.";
      document.getElementById("studentId").textContent = p.student_code || "Pending";
      document.getElementById("avatarInitials").textContent = initials(p.full_name);
      document.getElementById("profileName").textContent = p.full_name;
      document.getElementById("profileEmail").textContent = p.email;
      document.getElementById("profileDob").textContent = formatDate(p.date_of_birth);
      document.getElementById("profileState").textContent = p.state_of_origin;
      document.getElementById("profileNin").textContent = p.nin || "Not provided";
      document.getElementById("profileReferral").textContent = p.referral_source || "—";
      document.getElementById("profileJoined").textContent = formatDate(p.created_at);
    }

    function loadResources() {
      client.from("resources").select("*").order("created_at", { ascending: false }).then(function (res) {
        var grid = document.getElementById("resourceGrid");
        if (res.error || !res.data || !res.data.length) {
          grid.innerHTML = '<p class="empty-state">No resources have been uploaded yet. Check back soon.</p>';
          return;
        }
        grid.innerHTML = res.data.map(function (r) {
          var thumb;
          if (r.type === "video") {
            var yid = youtubeId(r.url);
            thumb = yid
              ? '<iframe src="https://www.youtube.com/embed/' + yid + '" title="' + escapeHtml(r.title) + '" allowfullscreen loading="lazy"></iframe>'
              : '<div class="link-thumb"><svg class="icon"><use href="#icon-play"></use></svg></div>';
          } else {
            thumb = '<a class="link-thumb" href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener"><svg class="icon"><use href="#icon-link"></use></svg></a>';
          }
          return (
            '<div class="resource-card">' +
              '<div class="resource-thumb">' + thumb + '</div>' +
              '<div class="resource-body">' +
                '<span class="resource-tag">' + (r.type === "video" ? "Video" : "Link") + '</span>' +
                '<h3>' + escapeHtml(r.title) + '</h3>' +
                (r.description ? '<p>' + escapeHtml(r.description) + '</p>' : '') +
                '<a class="open-link" href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener">Open in new tab &rarr;</a>' +
              '</div>' +
            '</div>'
          );
        }).join("");
      });
    }

    function loadTasks(profile) {
      Promise.all([
        client.from("tasks").select("*").order("created_at", { ascending: true }),
        client.from("task_completions").select("task_id, completed_at").eq("student_id", profile.id)
      ]).then(function (results) {
        var tasksRes = results[0], compRes = results[1];
        var list = document.getElementById("taskList");
        if (tasksRes.error || !tasksRes.data || !tasksRes.data.length) {
          list.innerHTML = '<p class="empty-state">No tasks have been assigned yet.</p>';
          updateProgress(0, 0);
          return;
        }
        var completedMap = {};
        (compRes.data || []).forEach(function (c) { completedMap[c.task_id] = c.completed_at; });

        list.innerHTML = tasksRes.data.map(function (t) {
          var done = !!completedMap[t.id];
          return (
            '<div class="task-row' + (done ? " is-done" : "") + '" data-task-id="' + t.id + '">' +
              '<button type="button" class="task-check" aria-label="Toggle complete">' +
                (done ? '<svg class="icon"><use href="#icon-check"></use></svg>' : '') +
              '</button>' +
              '<div class="task-body">' +
                '<h4>' + escapeHtml(t.title) + '</h4>' +
                (t.description ? '<p>' + escapeHtml(t.description) + '</p>' : '') +
                '<p class="task-meta">' +
                  (t.due_date ? "Due " + formatDate(t.due_date) + " · " : "") +
                  (done ? "Completed " + formatDate(completedMap[t.id]) : "Not completed yet") +
                '</p>' +
              '</div>' +
            '</div>'
          );
        }).join("");

        updateProgress(compRes.data ? compRes.data.length : 0, tasksRes.data.length);

        list.querySelectorAll(".task-row").forEach(function (row) {
          row.querySelector(".task-check").addEventListener("click", function () {
            var taskId = row.getAttribute("data-task-id");
            var isDone = row.classList.contains("is-done");
            if (isDone) {
              client.from("task_completions").delete().eq("task_id", taskId).eq("student_id", profile.id)
                .then(function () { loadTasks(profile); });
            } else {
              client.from("task_completions").insert({ task_id: taskId, student_id: profile.id })
                .then(function () { loadTasks(profile); });
            }
          });
        });
      });
    }

    function updateProgress(done, total) {
      var pct = total ? Math.round((done / total) * 100) : 0;
      document.getElementById("progressFill").style.width = pct + "%";
      document.getElementById("progressLabel").textContent = done + " of " + total + " tasks completed";
    }

    // ---------------- Admin-only tools ----------------
    function wireAdminForms() {
      document.getElementById("resourceForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var payload = {
          title: document.getElementById("resTitle").value.trim(),
          type: document.getElementById("resType").value,
          url: document.getElementById("resUrl").value.trim(),
          description: document.getElementById("resDesc").value.trim() || null,
          created_by: currentStudent.auth_user_id
        };
        client.from("resources").insert(payload).then(function (res) {
          if (res.error) { alert(res.error.message); return; }
          e.target.reset();
          loadResources();
          loadAdminLists();
        });
      });

      document.getElementById("taskForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var payload = {
          title: document.getElementById("taskTitle").value.trim(),
          description: document.getElementById("taskDesc").value.trim() || null,
          due_date: document.getElementById("taskDue").value || null,
          created_by: currentStudent.auth_user_id
        };
        client.from("tasks").insert(payload).then(function (res) {
          if (res.error) { alert(res.error.message); return; }
          e.target.reset();
          loadTasks(currentStudent);
          loadAdminLists();
        });
      });
    }

    function loadAdminLists() {
      client.from("resources").select("id, title").order("created_at", { ascending: false }).then(function (res) {
        var wrap = document.getElementById("resourceAdminList");
        wrap.innerHTML = (res.data || []).map(function (r) {
          return '<div class="admin-list-row"><span>' + escapeHtml(r.title) + '</span><button class="del-btn" data-id="' + r.id + '">Remove</button></div>';
        }).join("");
        wrap.querySelectorAll(".del-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            client.from("resources").delete().eq("id", btn.getAttribute("data-id")).then(function () {
              loadResources(); loadAdminLists();
            });
          });
        });
      });

      client.from("tasks").select("id, title").order("created_at", { ascending: false }).then(function (res) {
        var wrap = document.getElementById("taskAdminList");
        wrap.innerHTML = (res.data || []).map(function (t) {
          return '<div class="admin-list-row"><span>' + escapeHtml(t.title) + '</span><button class="del-btn" data-id="' + t.id + '">Remove</button></div>';
        }).join("");
        wrap.querySelectorAll(".del-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            client.from("tasks").delete().eq("id", btn.getAttribute("data-id")).then(function () {
              loadTasks(currentStudent); loadAdminLists();
            });
          });
        });
      });
    }
  });
})();
