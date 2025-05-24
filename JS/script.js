// This fucntion to fetch and display available slots
function fetchAndDisplaySlots(venue, datevalue) {
  //date formatting
  const parts = datevalue.split("-");
  const fdate = `${parts[2]}/${parts[1]}/${parts[0]}`;

  //This URL for fetching slots
  const url = `https://proj-backend-seven.vercel.app/bookings?venue=${encodeURIComponent(
    venue
  )}&date=${encodeURIComponent(fdate)}`;

  // Fetching available slots
  fetch(url)
    .then((resp) => {
      if (!resp.ok) {
        const slotcont = document.querySelector(".slots");
        slotcont.innerHTML = "<h2>Please select Today or future date</h2>";
        throw new Error(
          `Network response was not ok: ${resp.status} ${resp.statusText}`
        );
      }
      return resp.json();
    })
    //this code displays the available slots
    .then((slots) => {
      const slotcont = document.querySelector(".slots");
      const confirmcont = document.querySelector(".confirm");
      confirmcont.innerHTML = "";
      slotcont.innerHTML = "";
      let h2ele = document.querySelector(".book h2");
      if (!h2ele) {
        h2ele = document.createElement("h2");
        h2ele.textContent = "Available slots";
        document.querySelector(".book").prepend(h2ele);
      }
      if (slots.length === 0) {
        slotcont.innerHTML = "<h3>No slots available</h3>";
      } else {
        slots.forEach((s) => {
          const btn = document.createElement("button");
          btn.innerText = s.s;

          btn.addEventListener("click", () => {
            const selectedTime = s.s;
            const formattedDate = fdate;
            const rawDate = datevalue;
            const selectedVenue = venue;
            showBookingForm(
              selectedVenue,
              formattedDate,
              selectedTime,
              selectedVenue,
              rawDate
            );
          });
          btn.classList.add("slot-btn");
          slotcont.appendChild(btn);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching slots:", error);
    });
}

// This code handles the searching of venues and dates
document.getElementById("booking-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const venue = document.getElementById("venue").value;
  const datevalue = document.getElementById("venue-date").value;
  fetchAndDisplaySlots(venue, datevalue);
});

// this function is to show booking form
function showBookingForm(
  selectedVenue,
  selectedDate,
  selectedTime,
  originalVenue,
  originalRawDate
) {
  fetch(
    `https://proj-backend-seven.vercel.app/bookings/venue/${encodeURIComponent(selectedVenue)}`
  )
    .then((resp) => {
      if (!resp.ok) throw new Error("Failed to fetch venue details");
      return resp.json();
    })
    .then(({ data }) => {
      const { venue, address, sports } = data;
      document.querySelector(".slots").innerHTML = "";
      const h2ele = document.querySelector(".book h2");
      if (h2ele) {
        h2ele.remove();
      }
      //This code displays the booking form
      document.querySelector(".confirm").innerHTML = `
                <div class="booking-header">
                    <div><h2>Book Your Slot</h2></div>
                    <div><button class="cancel-btn">Cancel</button></div>
                </div>
                <div class="booking-info">
                    <p><strong>Venue:</strong> ${venue}</p>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>Date:</strong> ${selectedDate}</p>
                    <p><strong>Time:</strong> ${selectedTime}-${
        parseInt(selectedTime.split(":")[0]) + 1
      }:00</p>
                </div>
                <form id="confirm-form" class="booking-form">
                    <div class="form-group">
                        <label for="cust-name">Your Name</label>
                        <input type="text" id="cust-name" required />
                    </div>
                    <div class="form-group">
                        <label for="cust-email">Email</label>
                        <input type="email" id="cust-email" required />
                    </div>
                    <div class="form-group">
                        <label for="cust-phone">Phone Number</label>
                        <input type="tel" id="cust-phone" required />
                    </div>
                    <div class="form-group">
                        <label for="cust-sport">Sport</label>
                        <select id="cust-sport">
                            ${sports
                              .map((s) => `<option value="${s}">${s}</option>`)
                              .join("")}
                        </select>
                    </div>
                    <button type="submit" class="book-now-btn">Book Now</button>
                </form>
            `;
      document.querySelector(".cancel-btn").onclick = () => {
        document.querySelector(".confirm").innerHTML = "";
        fetchAndDisplaySlots(originalVenue, originalRawDate);
      };
    })
    .catch((error) => {
      console.error("Error fetching venue details:", error);
    });
}
// this code handles book Now form submission
document.addEventListener("submit", (e) => {
  if (e.target.matches("#confirm-form")) {
    e.preventDefault();
    console.log("Confirm form submitted");

    const name = document.getElementById("cust-name").value;
    const email = document.getElementById("cust-email").value;
    const phone = document.getElementById("cust-phone").value;
    const sport = document.getElementById("cust-sport").value;

    const venue = document
      .querySelector(".booking-info p:nth-child(1)")
      .textContent.replace("Venue: ", "");
    const date = document
      .querySelector(".booking-info p:nth-child(3)")
      .textContent.replace("Date: ", "");
    const time = document
      .querySelector(".booking-info p:nth-child(4)")
      .textContent.replace("Time: ", "")
      .split("-")[0]; // Get start time (e.g., "10:00")
    const address = document
      .querySelector(".booking-info p:nth-child(2)").textContent.replace("Address: ","");
    const bookingData = {
      venue,
      sports: sport,
      date,
      time,
    };
    //POST request to book the slot
    fetch("https://proj-backend-seven.vercel.app/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then(async resp => {
  const text = await resp.text();
  try {
    const data = JSON.parse(text);
    if (!resp.ok) throw new Error(data.message || resp.statusText);
    return data;
  } catch {
    throw new Error(`Invalid JSON from server:\n${text.slice(0,200)}`);
  }
})
      .then((response) => {
        console.log("Booking response:", response);
        function generateBookingId() {
          const pf = "BK";
          const tstp = Date.now().toString(36);
          const random = Math.floor(Math.random() * 1e5).toString(36);
          return `${pf}-${tstp}-${random}`.toUpperCase();
        }
        const bookingId = generateBookingId();
        alert(
          `✅ Booking Confirmed!\n\n` +
            `📄 Booking ID: ${bookingId}\n` +
            `📍 Venue: ${venue}\n` +
            `🏠 Address: ${address}\n` +
            `📅 Date: ${date}\n` +
            `⏰ Time: ${time}`
        );
        // Clear confirm section and repopulate slots

        document.querySelector(".confirm").innerHTML = "";
        fetchAndDisplaySlots(venue, date);
      })
      .catch((error) => {
        console.error("Booking error:", error);
        alert(`Error: ${error.message}`);
      });
  }
});
function initialtext() {
  const sltcnt = document.querySelector(".slots");
  const cnfcnt = document.querySelector(".confirm");
  cnfcnt.innerHTML = "";
  sltcnt.innerHTML = "<h3>Please select the venue and date</h3>";
}
document.addEventListener("DOMContentLoaded", () => {
  initialtext();
});
