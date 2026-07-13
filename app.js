(function () {
  "use strict";

  // Always include concierge + Ruby (Cc when L&Q is To; otherwise To).
  // L&Q manages Slessor + Courtney only — added on those buildings.
  // Noble + Deering = other firms (emails TBD via Ruby); until then same as others.
  var EMAIL_CONCIERGE = "concierge@kvmeridiangate.net";
  var EMAIL_RUBY = "Ruby.Frampton@rendallandrittner.co.uk";
  var EMAIL_LQ = "zaykhan@lqgroup.org.uk";
  var LQ_BUILDINGS = ["Slessor House", "Courtney House"];

  var ASB_LABELS = {
    excessive_noise: "Excessive noise",
    littering: "Littering / fly-tipping",
    loud_music: "Loud music / parties",
    verbal_abuse: "Verbal abuse / intimidation",
    drug_related: "Drug-related activity",
    vandalism: "Vandalism / damage",
    parking: "Parking / vehicle issues",
    smell_smoke: "Smell / smoke / BBQ nuisance",
    pets: "Pets / animal nuisance",
    communal: "Communal area misuse",
    balcony_storage: "Storage items on balcony / clothing",
    other: "Other",
  };

  var ASB_MORE = {
    excessive_noise:
      "Include how long it lasted, how often it happens, and how it affects you (sleep, work, wellbeing).",
    littering:
      "Note where the litter or fly-tipping is, roughly how much, and if it is blocking access or fire routes.",
    loud_music:
      "Note start/end if known, volume, bass, and whether it is a one-off or repeated.",
    verbal_abuse:
      "Do not put yourself at risk. Note time, location, and a factual description only.",
    drug_related:
      "Describe what you observed factually (smell, activity, location). Do not confront anyone.",
    vandalism:
      "Describe the damage and exact location. A photo helps if it is safe to take one.",
    parking:
      "Note vehicle details if known (colour, type, plate if visible) and where it is obstructing.",
    smell_smoke:
      "Note type of smell/smoke if known, when it happens, and which direction it seems to come from.",
    pets: "Note the issue (noise, mess, roaming) and where/when it occurred.",
    communal:
      "Note which communal area and what is happening (blocking exits, misuse, gatherings).",
    balcony_storage:
      "Note items stored or hanging on balconies, which floor/side if known. A photo helps.",
    other: "Describe the behaviour clearly and when/where it happened.",
  };

  var form = document.getElementById("asb-form");
  var building = document.getElementById("building");
  var otherBuildingField = document.getElementById("otherBuildingField");
  var otherBuilding = document.getElementById("otherBuilding");
  var asbType = document.getElementById("asbType");
  var otherAsbField = document.getElementById("otherAsbField");
  var otherAsb = document.getElementById("otherAsb");
  var moreToggle = document.getElementById("moreToggle");
  var moreDetail = document.getElementById("moreDetail");
  var photo = document.getElementById("photo");
  var photoPreviewWrap = document.getElementById("photoPreviewWrap");
  var photoPreview = document.getElementById("photoPreview");
  var clearPhoto = document.getElementById("clearPhoto");
  var statusEl = document.getElementById("status");
  var confirmPanel = document.getElementById("confirmPanel");
  var photoConfirm = document.getElementById("photoConfirm");
  var copyBtn = document.getElementById("copyBtn");
  var againBtn = document.getElementById("againBtn");
  var copyStatus = document.getElementById("copyStatus");
  var incidentDate = document.getElementById("incidentDate");
  var incidentTime = document.getElementById("incidentTime");

  var lastReportBody = "";
  var hasPhoto = false;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setNowDefaults() {
    var now = new Date();
    incidentDate.value =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate());
    incidentTime.value = pad(now.getHours()) + ":" + pad(now.getMinutes());
  }

  function formatDateDisplay(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function formatTimeDisplay(t) {
    if (!t) return "";
    var parts = t.split(":");
    if (parts.length < 2) return t;
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + suffix;
  }

  function locationLabel() {
    var b = building.value;
    if (b === "Other") {
      return (otherBuilding.value || "").trim() || "Other (not specified)";
    }
    return b;
  }

  function asbLabel() {
    var key = asbType.value;
    if (key === "other") {
      var custom = (otherAsb.value || "").trim();
      return custom ? "Other: " + custom : "Other";
    }
    return ASB_LABELS[key] || key;
  }

  function buildReportBody() {
    var lines = [
      "Kidbrooke ASB Report",
      "--------------------",
      "",
      "This is a neighbour report for property managers to review and escalate as needed.",
      "",
      "WHEN",
      "Date: " + formatDateDisplay(incidentDate.value),
      "Time: " + formatTimeDisplay(incidentTime.value),
      "",
      "WHERE",
      "Building / area: " + locationLabel(),
      "Flat / unit (if known): " +
        ((document.getElementById("flatNumber").value || "").trim() || "Not provided"),
      "Where on building: " +
        ((document.getElementById("buildingArea").value || "").trim() ||
          "Not provided"),
      "",
      "ISSUE",
      "Type: " + asbLabel(),
      "Notes: " +
        ((document.getElementById("notes").value || "").trim() || "None"),
      "",
      "REPORTER",
      "Name: " + (document.getElementById("reporterName").value || "").trim(),
      "Address: " +
        (document.getElementById("reporterAddress").value || "").trim(),
      "",
      "PHOTO",
      hasPhoto
        ? "A photo was selected on the report form. Please attach it from the device camera roll or photo library before sending."
        : "No photo attached.",
      "",
      "Map reference: https://www.google.com/maps/@51.4577273,0.0307891,187m/data=!3m1!1e3",
      "",
      "Sent via Kidbrooke ASB Report (static form; no data stored on the website).",
    ];
    return lines.join("\n");
  }

  function recipientsForBuilding(buildingName) {
    // Always keep concierge + Ruby on every report.
    // L&Q only for Slessor + Courtney (not Noble/Deering — different firms, emails TBD).
    var always = [EMAIL_CONCIERGE, EMAIL_RUBY];
    var isLq = LQ_BUILDINGS.indexOf(buildingName) !== -1;
    if (isLq) {
      return { to: [EMAIL_LQ], cc: always };
    }
    return { to: always, cc: [] };
  }

  function buildMailto(body) {
    var loc = locationLabel();
    // Route by dropdown value (not free-text "Other" name)
    var routeBuilding =
      building.value === "Other" ? "Other" : building.value;
    var rec = recipientsForBuilding(routeBuilding);
    var subject =
      "Kidbrooke ASB report – " +
      loc +
      " – " +
      asbLabel() +
      " – " +
      formatDateDisplay(incidentDate.value);
    var href =
      "mailto:" +
      rec.to.join(",") +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    if (rec.cc && rec.cc.length) {
      href += "&cc=" + encodeURIComponent(rec.cc.join(","));
    }
    return href;
  }

  function clearInvalid() {
    form.querySelectorAll(".field.invalid").forEach(function (el) {
      el.classList.remove("invalid");
    });
  }

  function markInvalid(el) {
    var field = el.closest(".field");
    if (field) field.classList.add("invalid");
  }

  function validate() {
    clearInvalid();
    var ok = true;
    var required = [
      document.getElementById("reporterName"),
      document.getElementById("reporterAddress"),
      incidentDate,
      incidentTime,
      building,
      asbType,
    ];

    required.forEach(function (el) {
      if (!el.value || !String(el.value).trim()) {
        markInvalid(el);
        ok = false;
      }
    });

    if (building.value === "Other" && !(otherBuilding.value || "").trim()) {
      markInvalid(otherBuilding);
      ok = false;
    }

    if (asbType.value === "other" && !(otherAsb.value || "").trim()) {
      markInvalid(otherAsb);
      ok = false;
    }

    return ok;
  }

  building.addEventListener("change", function () {
    var isOther = building.value === "Other";
    otherBuildingField.classList.toggle("hidden", !isOther);
    otherBuilding.required = isOther;
    if (!isOther) otherBuilding.value = "";
  });

  asbType.addEventListener("change", function () {
    var key = asbType.value;
    var isOther = key === "other";
    otherAsbField.classList.toggle("hidden", !isOther);
    otherAsb.required = isOther;
    if (!isOther) otherAsb.value = "";

    if (key && ASB_MORE[key]) {
      moreToggle.hidden = false;
      moreDetail.hidden = true;
      moreDetail.textContent = ASB_MORE[key];
      moreToggle.textContent = "More about this issue type";
    } else {
      moreToggle.hidden = true;
      moreDetail.hidden = true;
      moreDetail.textContent = "";
    }
  });

  moreToggle.addEventListener("click", function () {
    var open = moreDetail.hidden;
    moreDetail.hidden = !open;
    moreToggle.textContent = open
      ? "Hide details"
      : "More about this issue type";
  });

  photo.addEventListener("change", function () {
    var file = photo.files && photo.files[0];
    if (!file) {
      hasPhoto = false;
      photoPreviewWrap.classList.add("hidden");
      photoPreview.removeAttribute("src");
      return;
    }
    hasPhoto = true;
    var url = URL.createObjectURL(file);
    photoPreview.src = url;
    photoPreviewWrap.classList.remove("hidden");
  });

  clearPhoto.addEventListener("click", function () {
    photo.value = "";
    hasPhoto = false;
    photoPreviewWrap.classList.add("hidden");
    photoPreview.removeAttribute("src");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    copyStatus.textContent = "";

    if (!validate()) {
      statusEl.textContent = "Please complete the required fields.";
      var first = form.querySelector(".field.invalid");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    lastReportBody = buildReportBody();
    var href = buildMailto(lastReportBody);

    // Guard extremely long mailto URLs on some clients
    if (href.length > 1800) {
      statusEl.textContent =
        "Report is ready. Your email app link is long — use Copy report text if Mail does not open fully.";
    }

    form.classList.add("hidden");
    confirmPanel.classList.remove("hidden");
    photoConfirm.hidden = !hasPhoto;
    confirmPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    // Open device email client
    window.location.href = href;
  });

  copyBtn.addEventListener("click", function () {
    var text = lastReportBody || buildReportBody();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          copyStatus.textContent = "Report text copied.";
        },
        function () {
          fallbackCopy(text);
        }
      );
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      copyStatus.textContent = "Report text copied.";
    } catch (err) {
      copyStatus.textContent = "Could not copy. Please select and copy manually.";
    }
    document.body.removeChild(ta);
  }

  againBtn.addEventListener("click", function () {
    form.reset();
    setNowDefaults();
    hasPhoto = false;
    photoPreviewWrap.classList.add("hidden");
    otherBuildingField.classList.add("hidden");
    otherAsbField.classList.add("hidden");
    moreToggle.hidden = true;
    moreDetail.hidden = true;
    clearInvalid();
    statusEl.textContent = "";
    copyStatus.textContent = "";
    confirmPanel.classList.add("hidden");
    form.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Expose for automated verification in browser console / tests
  window.KidbrookeASB = {
    buildReportBody: buildReportBody,
    buildMailto: function () {
      return buildMailto(buildReportBody());
    },
    recipientsForBuilding: recipientsForBuilding,
    setHasPhoto: function (v) {
      hasPhoto = !!v;
    },
  };

  setNowDefaults();
})();
