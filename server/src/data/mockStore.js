export const mockStore = {
  users: [
    {
      id: "usr_admin_1",
      email: "admin@eventflow.com",
      password: "admin123",
      name: "Ashwin Telang",
      role: "admin",
      organization: "Alliance University",
      category: "Admin",
      avatar: "A"
    },
    {
      id: "usr_staff_1",
      email: "priya@eventflow.com",
      password: "staff123",
      name: "Priya Sharma",
      role: "staff",
      organization: "AU-QUASAR Operations",
      category: "Event Staff",
      avatar: "P"
    },
    {
      id: "usr_student_1",
      email: "rohan@eventflow.com",
      password: "student123",
      name: "Rohan Patil",
      role: "attendee",
      organization: "Alliance University",
      category: "Student",
      avatar: "R"
    }
  ],

  attendees: [
    {
      id: "AU2026-001",
      name: "Rohan Patil",
      email: "rohan.patil@example.com",
      phone: "+91 98765 43210",
      category: "Student",
      organization: "Alliance University",
      designation: "Undergraduate CSE",
      department: "AI & Data Science",
      status: "Checked In",
      registeredAt: "24 Oct, 09:12 AM",
      checkedInAt: "24 Oct, 09:12 AM"
    },
    {
      id: "AU2026-002",
      name: "Priya Sharma",
      email: "priya.s@example.com",
      phone: "+91 87654 32109",
      category: "Working Professional",
      organization: "Infosys",
      designation: "Senior Cloud Engineer",
      department: "DevOps",
      status: "Registered",
      registeredAt: "23 Oct, 06:45 PM",
      checkedInAt: null
    },
    {
      id: "AU2026-003",
      name: "Karan Mehta",
      email: "karan.m@example.com",
      phone: "+91 76543 21098",
      category: "Founder",
      organization: "TechNova",
      designation: "Co-Founder & CTO",
      department: "Autonomous Systems",
      status: "Checked In",
      registeredAt: "23 Oct, 04:20 PM",
      checkedInAt: "24 Oct, 08:55 AM"
    },
    {
      id: "AU2026-004",
      name: "Sneha Rao",
      email: "sneha.rao@example.com",
      phone: "+91 65432 10987",
      category: "Researcher",
      organization: "IISc Bengaluru",
      designation: "Research Scholar",
      department: "Computational Biology",
      status: "Registered",
      registeredAt: "22 Oct, 11:30 AM",
      checkedInAt: null
    },
    {
      id: "AU2026-005",
      name: "Aditya Kulkarni",
      email: "aditya.k@example.com",
      phone: "+91 54321 09876",
      category: "Startup",
      organization: "BuildLabs",
      designation: "Lead Product Architect",
      department: "Hardware & IoT",
      status: "Checked In",
      registeredAt: "22 Oct, 10:15 AM",
      checkedInAt: "24 Oct, 09:30 AM"
    },
    {
      id: "AU2026-006",
      name: "Neha Gupta",
      email: "neha.g@example.com",
      phone: "+91 43210 98765",
      category: "Student",
      organization: "Alliance University",
      designation: "Graduate Student",
      department: "MBA Innovation",
      status: "Registered",
      registeredAt: "21 Oct, 08:40 PM",
      checkedInAt: null
    },
    {
      id: "AU2026-007",
      name: "Siddharth Iyer",
      email: "siddharth.i@example.com",
      phone: "+91 32109 87654",
      category: "Developer",
      organization: "Freelance",
      designation: "Full Stack Engineer",
      department: "Web3 & AI",
      status: "Checked In",
      registeredAt: "21 Oct, 06:10 PM",
      checkedInAt: "24 Oct, 09:15 AM"
    },
    {
      id: "AU2026-008",
      name: "Aisha Khan",
      email: "aisha.k@example.com",
      phone: "+91 21098 76543",
      category: "Other",
      organization: "Independent",
      designation: "Consultant",
      department: "Venture Builder",
      status: "Registered",
      registeredAt: "21 Oct, 05:45 PM",
      checkedInAt: null
    },
    {
      id: "AU2026-009",
      name: "Vikram Singh",
      email: "vikram.s@example.com",
      phone: "+91 10987 65432",
      category: "Working Professional",
      organization: "TCS",
      designation: "Systems Architect",
      department: "Applied AI",
      status: "Checked In",
      registeredAt: "20 Oct, 04:20 PM",
      checkedInAt: "24 Oct, 09:40 AM"
    },
    {
      id: "AU2026-010",
      name: "Meera Deshpande",
      email: "meera.d@example.com",
      phone: "+91 99887 66554",
      category: "Student",
      organization: "Alliance University",
      designation: "Sophomore",
      department: "Electronics & Robotics",
      status: "Registered",
      registeredAt: "20 Oct, 03:15 PM",
      checkedInAt: null
    }
  ],

  announcements: [
    {
      id: "ann_1",
      title: "Welcome to IDEA → AI → IMPACT",
      message: "We're excited to have you all at AU-QUASAR! Get ready for an intense day of innovation, collaboration, and prototyping.",
      type: "General",
      status: "Published",
      date: "24 Oct, 08:00 AM"
    },
    {
      id: "ann_2",
      title: "Event Venue & Entry Logistics",
      message: "The event is hosted at the AU-QUASAR Innovation Center, Alliance University, Bengaluru. Please enter via Gate 2 and head to Block B.",
      type: "Logistics",
      status: "Published",
      date: "23 Oct, 06:00 PM"
    },
    {
      id: "ann_3",
      title: "Registration & Badge Verification",
      message: "Registration desks are active at the foyer. Carry a valid government or student ID card to collect your smart access badge.",
      type: "Registration",
      status: "Published",
      date: "20 Oct, 10:00 AM"
    },
    {
      id: "ann_4",
      title: "What to Bring & Setup Guidelines",
      message: "Please carry your laptops, chargers, and development toolchains pre-installed. High-speed WiFi credentials will be issued at check-in.",
      type: "Guidelines",
      status: "Published",
      date: "20 Oct, 12:00 PM"
    },
    {
      id: "ann_5",
      title: "Team Formation & Mentor Matchmaking",
      message: "Team formation will take place right after the keynote in Arena 1. Mentors from Microsoft, Google, and AU-QUASAR will be circulating.",
      type: "Activity",
      status: "Published",
      date: "22 Oct, 04:00 PM"
    },
    {
      id: "ann_6",
      title: "Schedule Update: Keynote Timing",
      message: "The opening address begins promptly at 10:00 AM, followed by the keynote 'Idea to Impact' at 10:15 AM.",
      type: "Schedule",
      status: "Published",
      date: "23 Oct, 08:30 PM"
    },
    {
      id: "ann_7",
      title: "Lunch & Networking Refreshments",
      message: "Complimentary artisan refreshments and buffet lunch will be served at the Quasar Courtyard starting at 1:00 PM.",
      type: "Logistics",
      status: "Scheduled",
      date: "24 Oct, 09:00 AM"
    },
    {
      id: "ann_8",
      title: "30-Day Venture Accelerator Challenge",
      message: "Top 3 winning teams today will receive direct incubation entry into AU-QUASAR's 30-Day Venture Accelerator with seed micro-grants.",
      type: "Opportunity",
      status: "Scheduled",
      date: "24 Oct, 12:30 PM"
    },
    {
      id: "ann_9",
      title: "Designated Parking Instructions",
      message: "Designated attendee parking is available at Gate 2 Multi-level facility. EV charging bays are available on Ground Floor.",
      type: "Logistics",
      status: "Published",
      date: "21 Oct, 11:00 AM"
    },
    {
      id: "ann_10",
      title: "Closing Ceremony & Mentor Recognition",
      message: "Team pitches start at 12:30 PM followed by mentor acknowledgements and certificate awards. Thank you for making an impact!",
      type: "General",
      status: "Published",
      date: "24 Oct, 12:45 PM"
    }
  ],

  eventFlow: [
    {
      stage: 1,
      title: "Registration & Check-In",
      time: "8:30 AM – 10:00 AM",
      description: "Participants arrive at the venue, complete check-in, collect smart badges, and receive their curated event kit.",
      activities: [
        "QR code / Photo ID verification",
        "Event kit & NFC badge distribution",
        "Help desk & Wi-Fi support station"
      ]
    },
    {
      stage: 2,
      title: "Opening & Welcome",
      time: "10:00 AM – 10:15 AM",
      description: "Official inauguration and opening remarks by the AU-QUASAR leadership team and Alliance University dignitaries.",
      activities: [
        "Welcome address by Dean of Innovation",
        "Overview of event goals & safety briefing",
        "Introduction of mentors, judges & industry guests"
      ]
    },
    {
      stage: 3,
      title: "Idea to Impact: Setting the Stage",
      time: "10:15 AM – 10:45 AM",
      description: "Inspiring keynote session on real-world engineering, applied AI, and building sustainable technological impact.",
      activities: [
        "Keynote address by Industry Veteran",
        "Real-world case studies & AI breakthroughs",
        "Audience Q&A & interactive poll"
      ]
    },
    {
      stage: 4,
      title: "Team Formation & Problem Statements",
      time: "10:45 AM – 11:30 AM",
      description: "Participants pitch rough concepts, form cross-disciplinary teams, and lock in their selected problem tracks.",
      activities: [
        "Cross-functional team matchmaking",
        "Problem statement briefing & track criteria",
        "Initial mentor alignment & brainstorming"
      ]
    },
    {
      stage: 5,
      title: "Build, Explore & Mentor Sprints",
      time: "11:30 AM – 12:30 PM",
      description: "Hands-on engineering sprints where teams prototype their architecture with continuous feedback from technical mentors.",
      activities: [
        "Intensive rapid prototyping sprint",
        "1-on-1 technical mentor guidance",
        "Pitch deck & demo preparation"
      ]
    },
    {
      stage: 6,
      title: "Team Pitches & Closing",
      time: "12:30 PM – 1:00 PM",
      description: "Teams showcase live prototypes to the judging panel, followed by awards, accelerator invites, and closing ceremony.",
      activities: [
        "3-minute team demo pitches",
        "Jury evaluation & live feedback",
        "Closing remarks, awards & group photo"
      ]
    }
  ],

  organizations: [
    { name: "Alliance University", count: 48, color: "#168bff" },
    { name: "Infosys", count: 22, color: "#a13dff" },
    { name: "TechNova", count: 18, color: "#f10d8e" },
    { name: "IISc Bengaluru", count: 16, color: "#ffb21a" },
    { name: "BuildLabs", count: 14, color: "#10ddb0" },
    { name: "TCS", count: 12, color: "#13d6e6" },
    { name: "Independent", count: 10, color: "#43c9f1" },
    { name: "Others", count: 6, color: "#cbd8f1" }
  ]
};
