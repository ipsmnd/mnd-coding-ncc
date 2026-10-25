"use strict";
/* ============================================================
   PRACTICE ARENA — topic-wise practice questions and timed mock
   exams. Progress is stored in this browser only.
   ============================================================ */
const PRACTICE_BANK = (() => {
  const mcq = (q, o, a) => ({ t: "mcq", q, o, a });
  const tf = (q, a) => ({ t: "tf", q, a });
  const multi = (q, o, a) => ({ t: "multi", q, o, a });
  const fill = (q, a) => ({ t: "fill", q, a });
  const order = (q, o) => ({ t: "order", q, o });
  const match = (q, p) => ({ t: "match", q, p });

  const TYPE_LABEL = {
    mcq: "Multiple choice",
    tf: "True / False",
    multi: "Multiple select",
    fill: "Fill in the blank",
    order: "Put in order",
    match: "Match the pairs"
  };
  const TYPE_HINT = {
    mcq: "Choose one answer.",
    tf: "Decide whether the statement is true or false.",
    multi: "Select all answers that apply.",
    fill: "Type your answer, then press Enter or Check answer.",
    order: "Use the arrows to move items into the correct order.",
    match: "Pick the matching item for each row."
  };

  // Module Dataset (33 modules: 1-10 Networking, 11-20 Cloud, 21-33 Security)
  const MODULES_DATA = [
    // NETWORKING (1-10)
    { id: 1, title: "Module 1: OSI & TCP/IP Model Foundations", domain: "Networking", difficulty: "Beginner",
      description: "Understand the core 7-layer OSI model and 4-layer TCP/IP suite that power modern data communication.",
      qs: [
        mcq("Which OSI layer is responsible for logical IP addressing and packet routing?", ["Data Link (Layer 2)", "Network (Layer 3)", "Transport (Layer 4)", "Session (Layer 5)"], 1),
        tf("The TCP/IP model has 4 layers, while the OSI model has 7.", true),
        order("Arrange the OSI layers from Layer 1 (bottom) to Layer 7 (top).", ["Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application"]),
        match("Match each protocol to its OSI layer.", [["HTTP", "Application"], ["TCP", "Transport"], ["IP", "Network"], ["Ethernet", "Data Link"]])
      ] },
    { id: 2, title: "Module 2: IPv4 & IPv6 Subnetting Mechanics", domain: "Networking", difficulty: "Intermediate",
      description: "Master CIDR notation, variable-length subnet masking (VLSM), and IPv6 prefix aggregation.",
      qs: [
        mcq("How many usable host IP addresses are provided by a /28 IPv4 subnet?", ["14", "16", "30", "62"], 0),
        fill("The subnet mask 255.255.255.0 written in CIDR notation is /___ .", ["24", "/24"]),
        tf("A /30 subnet provides exactly 2 usable host addresses.", true),
        multi("Which prefixes can hold at least 50 usable hosts?", ["/24", "/26", "/27", "/28"], [0, 1])
      ] },
    { id: 3, title: "Module 3: Ethernet Switching & VLAN Segmentation", domain: "Networking", difficulty: "Beginner",
      description: "Explore Layer 2 MAC switching operations, 802.1Q trunking protocols, and VLAN isolation principles.",
      qs: [
        mcq("Which protocol prevents switching loops in redundant Layer 2 topology network layouts?", ["OSPF", "STP (Spanning Tree)", "BGP", "ARP"], 1),
        fill("The IEEE standard for VLAN tagging on trunk links is 802.___ .", ["1q"]),
        tf("Switches forward frames based on the destination MAC address.", true),
        match("Match each switching concept to what it does.", [["Access port", "Carries a single VLAN"], ["Trunk port", "Carries multiple tagged VLANs"], ["MAC address table", "Maps MAC addresses to ports"], ["Spanning Tree", "Blocks redundant paths"]])
      ] },
    { id: 4, title: "Module 4: Dynamic Routing with OSPF & BGP", domain: "Networking", difficulty: "Advanced",
      description: "Compare interior link-state routing (OSPF) with exterior path-vector routing (BGP) across autonomous systems.",
      qs: [
        mcq("What metric parameter does OSPF primarily rely on to determine path cost?", ["Hop Count", "Bandwidth", "Delay", "Path Vector"], 1),
        tf("BGP is an interior gateway protocol used only inside a single autonomous system.", false),
        multi("Which of these are link-state routing protocols?", ["OSPF", "IS-IS", "RIP", "BGP"], [0, 1]),
        fill("BGP peers establish their sessions over TCP port ___ .", ["179"])
      ] },
    { id: 5, title: "Module 5: Transport Protocols: TCP vs. UDP", domain: "Networking", difficulty: "Beginner",
      description: "Analyze reliable connection-oriented TCP handshake mechanisms versus connectionless UDP speed.",
      qs: [
        mcq("How many steps comprise the standard TCP session establishment procedure?", ["2-Way", "3-Way", "4-Way", "1-Way"], 1),
        order("Put the TCP three-way handshake messages in order.", ["SYN", "SYN-ACK", "ACK"]),
        multi("Which applications typically run over UDP?", ["DNS queries", "VoIP calls", "Live video streaming", "SSH sessions"], [0, 1, 2]),
        tf("UDP guarantees that packets arrive in order.", false)
      ] },
    { id: 6, title: "Module 6: DNS Architecture & Name Resolution", domain: "Networking", difficulty: "Intermediate",
      description: "Trace the hierarchical root-to-authoritative recursive name lookup process and DNS record types.",
      qs: [
        mcq("Which DNS record type maps a domain name directly to an IPv6 address?", ["A Record", "CNAME Record", "AAAA Record", "MX Record"], 2),
        match("Match each DNS record type to its purpose.", [["A", "Maps a name to an IPv4 address"], ["MX", "Names the mail server"], ["CNAME", "Alias to another name"], ["TXT", "Free text, e.g. domain verification"]]),
        order("Order the steps of a recursive lookup for www.example.com.", ["Recursive resolver misses its cache", "Root name server", "TLD name server (.com)", "Authoritative name server"]),
        fill("DNS queries use port ___ by default.", ["53"])
      ] },
    { id: 7, title: "Module 7: DHCP & Dynamic IP Allocation", domain: "Networking", difficulty: "Beginner",
      description: "Discover the DORA (Discover, Offer, Request, Acknowledge) flow for dynamic client addressing.",
      qs: [
        mcq("What is the final step in the standard 4-step DHCP client acquisition process?", ["Discover", "Offer", "Request", "Acknowledge (ACK)"], 3),
        order("Arrange the DORA steps in order.", ["Discover", "Offer", "Request", "Acknowledge"]),
        fill("DHCP servers listen on UDP port ___ .", ["67"]),
        tf("A client sends the DHCP Discover message as a broadcast.", true)
      ] },
    { id: 8, title: "Module 8: Network Address Translation (NAT/PAT)", domain: "Networking", difficulty: "Intermediate",
      description: "Learn how private IPv4 RFC 1918 space maps to public Internet routable addresses using port mapping.",
      qs: [
        mcq("Which NAT variant maps multiple internal IP addresses to a single public IP using port numbers?", ["Static NAT", "Dynamic NAT", "PAT (Port Address Translation)", "SNAT"], 2),
        multi("Which ranges are private (RFC 1918) address space?", ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "8.8.8.0/24"], [0, 1, 2]),
        tf("Static NAT creates a permanent one-to-one mapping between a private and a public address.", true),
        match("Match each translation type to how it works.", [["Static NAT", "Fixed one-to-one mapping"], ["Dynamic NAT", "One-to-one from a public pool"], ["PAT", "Many-to-one using ports"], ["Port forwarding", "Inbound traffic to an internal host"]])
      ] },
    { id: 9, title: "Module 9: Network Performance & QoS Management", domain: "Networking", difficulty: "Advanced",
      description: "Implement packet classification, traffic shaping, policy policing, and latency mitigation.",
      qs: [
        mcq("Which QoS mechanism buffers excess packets in queues to smooth out bursty traffic throughput?", ["Policing", "Shaping", "Tail Drop", "DSCP Marking"], 1),
        tf("Policing drops or re-marks traffic that exceeds the rate instead of buffering it.", true),
        fill("DSCP 46, used for voice traffic, is called Expedited Forwarding, abbreviated ___ .", ["ef"]),
        multi("Which of these are QoS tools?", ["Classification & marking", "Queuing", "Traffic shaping", "DHCP snooping"], [0, 1, 2])
      ] },
    { id: 10, title: "Module 10: Wireless Networking & Wi-Fi 6 Standards", domain: "Networking", difficulty: "Intermediate",
      description: "Evaluate 802.11 ax improvements including OFDMA, MU-MIMO, and WPA3 enterprise security standards.",
      qs: [
        mcq("Which Wi-Fi technology allows simultaneous multi-user transmission on split frequency channels?", ["OFDMA", "CSMA/CD", "WPA2-Personal", "FHSS"], 0),
        match("Match each IEEE standard to its Wi-Fi generation name.", [["802.11n", "Wi-Fi 4"], ["802.11ac", "Wi-Fi 5"], ["802.11ax", "Wi-Fi 6"], ["802.11be", "Wi-Fi 7"]]),
        tf("WPA3-Personal replaces the pre-shared key handshake with SAE (Simultaneous Authentication of Equals).", true),
        multi("Which frequency bands can Wi-Fi 6E use?", ["2.4 GHz", "5 GHz", "6 GHz", "60 GHz"], [0, 1, 2])
      ] },

    // CLOUD (11-20)
    { id: 11, title: "Module 11: Fundamentals of Cloud Computing", domain: "Cloud", difficulty: "Beginner",
      description: "Differentiate IaaS, PaaS, SaaS deployment models and elastic shared-responsibility frameworks.",
      qs: [
        mcq("Under the Cloud Shared Responsibility Model, who handles physical datacenter security?", ["The Customer", "The Cloud Provider", "Third-Party Auditor", "DevOps Engineer"], 1),
        match("Match each service model to an example.", [["IaaS", "Virtual machines and networks"], ["PaaS", "Managed app runtime platform"], ["SaaS", "Finished web application, e.g. email"], ["FaaS", "Functions run on events"]]),
        tf("In IaaS, the customer is responsible for patching the guest operating system.", true),
        multi("Which are NIST essential characteristics of cloud computing?", ["On-demand self-service", "Broad network access", "Rapid elasticity", "Fixed long-term capacity"], [0, 1, 2])
      ] },
    { id: 12, title: "Module 12: Virtualization & Hypervisor Mechanics", domain: "Cloud", difficulty: "Intermediate",
      description: "Examine Type-1 bare-metal and Type-2 hosted hypervisors for virtual machine abstraction.",
      qs: [
        mcq("Which of the following represents a Type-1 bare-metal hypervisor?", ["VirtualBox", "VMware ESXi", "VMware Workstation", "QEMU on Windows"], 1),
        tf("A Type-2 hypervisor runs on top of a host operating system.", true),
        multi("Which of these are Type-1 hypervisors?", ["VMware ESXi", "Microsoft Hyper-V", "KVM", "Oracle VirtualBox"], [0, 1, 2]),
        fill("A guest operating system running on a hypervisor is called a virtual ___ .", ["machine", "vm"])
      ] },
    { id: 13, title: "Module 13: Containerization with Docker & OCI", domain: "Cloud", difficulty: "Intermediate",
      description: "Build lightweight container images, layering configurations, environment variables, and microservice isolation.",
      qs: [
        mcq("What key kernel feature enables Linux process filesystem and network isolation for Docker?", ["cgroups and Namespaces", "SWAP space", "systemd", "IPTables"], 0),
        order("Put the container workflow in order.", ["Write a Dockerfile", "Build the image (docker build)", "Push to a registry (docker push)", "Run the container (docker run)"]),
        fill("The Dockerfile instruction that sets the base image is ___ .", ["from"]),
        tf("Each container ships with its own full operating system kernel.", false)
      ] },
    { id: 14, title: "Module 14: Kubernetes Orchestration Essentials", domain: "Cloud", difficulty: "Advanced",
      description: "Manage Pods, Deployments, Services, Ingress controllers, and automated horizontal auto-scaling.",
      qs: [
        mcq("What is the atomic deployable object in Kubernetes architecture?", ["Container", "Pod", "Node", "Cluster"], 1),
        match("Match each Kubernetes object to its role.", [["Deployment", "Manages replicas and rollouts"], ["Service", "Stable network endpoint for Pods"], ["Ingress", "HTTP routing from outside the cluster"], ["ConfigMap", "Non-secret configuration data"]]),
        fill("The command-line tool used to manage Kubernetes clusters is ___ .", ["kubectl"]),
        multi("Which are Kubernetes control plane components?", ["kube-apiserver", "etcd", "kube-scheduler", "kubelet"], [0, 1, 2])
      ] },
    { id: 15, title: "Module 15: Infrastructure as Code (IaC) with Terraform", domain: "Cloud", difficulty: "Intermediate",
      description: "Provision multi-cloud resource stacks declaratively using HCL state file management.",
      qs: [
        mcq("Which command in Terraform shows planned execution infrastructure changes without applying them?", ["terraform apply", "terraform plan", "terraform init", "terraform state"], 1),
        order("Order the Terraform commands in a typical lifecycle.", ["terraform init", "terraform plan", "terraform apply", "terraform destroy"]),
        fill("Terraform files are written in HashiCorp Configuration Language, abbreviated ___ .", ["hcl"]),
        tf("Terraform's state file records the real-world resources it manages.", true)
      ] },
    { id: 16, title: "Module 16: Cloud Storage Architecture Options", domain: "Cloud", difficulty: "Beginner",
      description: "Compare distributed Object Storage (S3), Block Storage (SAN/EBS), and File Systems (NFS/EFS).",
      qs: [
        mcq("Which cloud storage type is ideal for unstructured static media and HTTP public hosting?", ["Block Storage", "Object Storage", "RAM Disk", "Ephemeral Disk"], 1),
        match("Match each storage type to a typical use.", [["Object", "Images and backups in S3"], ["Block", "A virtual machine's boot disk"], ["File", "Shared NFS mount for many servers"], ["Archive", "Cheap long-term cold retention"]]),
        tf("Block storage volumes are usually accessed through HTTP REST APIs.", false),
        multi("Which are object storage services?", ["Amazon S3", "Google Cloud Storage", "Azure Blob Storage", "Amazon EBS"], [0, 1, 2])
      ] },
    { id: 17, title: "Module 17: Serverless Architectures & Event-Driven Apps", domain: "Cloud", difficulty: "Intermediate",
      description: "Design stateless microservices using FaaS functions responding to database triggers and HTTP API gateways.",
      qs: [
        mcq("What is a primary characteristic of cloud Serverless FaaS computing?", ["Always-on dedicated instances", "Pay-per-execution duration", "Manual kernel updates", "Fixed static billing"], 1),
        tf("Serverless functions can suffer from 'cold start' latency.", true),
        multi("Which events can trigger a serverless function?", ["An HTTP request through an API gateway", "A file uploaded to a bucket", "A message arriving on a queue", "An administrator's SSH login to the function"], [0, 1, 2]),
        fill("FaaS stands for Function as a ___ .", ["service"])
      ] },
    { id: 18, title: "Module 18: Cloud Load Balancing & Traffic Control", domain: "Cloud", difficulty: "Intermediate",
      description: "Implement Layer 4 network routing and Layer 7 HTTP application traffic load distribution.",
      qs: [
        mcq("At which OSI layer does an Application Load Balancer (ALB) inspect host headers and URI paths?", ["Layer 3", "Layer 4", "Layer 7", "Layer 2"], 2),
        match("Match each load-balancing algorithm to its behavior.", [["Round robin", "Each server in turn"], ["Least connections", "Server with the fewest active sessions"], ["IP hash", "Same client always to the same server"], ["Weighted", "Larger servers receive more traffic"]]),
        tf("A Layer 4 Network Load Balancer can route requests by URL path.", false),
        fill("Keeping a user pinned to the same backend server is called session ___ .", ["affinity", "stickiness", "persistence"])
      ] },
    { id: 19, title: "Module 19: High Availability & Multi-Region DR", domain: "Cloud", difficulty: "Advanced",
      description: "Architect active-active resilience topologies, RTO/RPO targets, and geo-redundant data replication.",
      qs: [
        mcq("What metric defines the maximum acceptable data loss timeframe during an emergency disaster?", ["RTO (Recovery Time Objective)", "RPO (Recovery Point Objective)", "SLA", "MTBF"], 1),
        order("Order the DR strategies from slowest recovery (cheapest) to fastest (most expensive).", ["Backup & restore", "Pilot light", "Warm standby", "Active-active multi-site"]),
        tf("RTO is the maximum acceptable time to restore service after an outage.", true),
        fill("99.99% availability is commonly called \"four ___\".", ["nines", "9s"])
      ] },
    { id: 20, title: "Module 20: Cloud FinOps & Cost Optimization", domain: "Cloud", difficulty: "Beginner",
      description: "Track resource usage metrics, spot pricing, rightsizing strategies, and cost tagging policies.",
      qs: [
        mcq("Which cloud purchasing model offers significant discount rates in exchange for 1-3 year commitments?", ["On-Demand", "Reserved / Savings Plans", "Spot Instances", "Pay-as-you-go"], 1),
        match("Match each pricing model to its description.", [["On-Demand", "No commitment, full price"], ["Reserved Instance", "Discount for a specific instance commitment"], ["Spot", "Spare capacity that can be interrupted"], ["Savings Plan", "Discount for a committed $/hour spend"]]),
        multi("Which actions reduce cloud cost?", ["Rightsizing underused instances", "Deleting unattached disks", "Auto-scaling with demand", "Running peak capacity 24/7"], [0, 1, 2]),
        tf("Spot instances are a good fit for interruption-tolerant batch jobs.", true)
      ] },

    // SECURITY (21-33)
    { id: 21, title: "Module 21: Identity & Access Management (IAM)", domain: "Security", difficulty: "Beginner",
      description: "Implement RBAC control principles, Least Privilege, MFA enforcement, and identity federation.",
      qs: [
        mcq("What fundamental security rule dictates granting only minimum necessary user privileges?", ["Defense in Depth", "Principle of Least Privilege", "Zero Trust", "Separation of Duty"], 1),
        match("Match each IAM term to its meaning.", [["Authentication", "Proving who you are"], ["Authorization", "Deciding what you can do"], ["MFA", "Two or more factor types"], ["SSO", "One login for many apps"]]),
        multi("Which are valid authentication factor categories?", ["Something you know", "Something you have", "Something you are", "Something you want"], [0, 1, 2]),
        tf("In RBAC, permissions are assigned to roles and users gain them through role membership.", true)
      ] },
    { id: 22, title: "Module 22: Public Key Infrastructure & Cryptography", domain: "Security", difficulty: "Intermediate",
      description: "Study symmetric AES ciphers, asymmetric RSA/ECC keys, TLS handshakes, and digital certificate chains.",
      qs: [
        mcq("Which cryptographic key is utilized to encrypt data in asymmetric RSA communication?", ["Private Key", "Recipient's Public Key", "Shared Secret", "Hash Salt"], 1),
        match("Match each algorithm to its category.", [["AES", "Symmetric cipher"], ["RSA", "Asymmetric cipher"], ["SHA-256", "Hash function"], ["ECDHE", "Key exchange"]]),
        tf("A digital signature is created with the sender's private key.", true),
        fill("A file that binds a public key to an identity and is signed by a CA is a digital ___ .", ["certificate", "cert"])
      ] },
    { id: 23, title: "Module 23: Zero Trust Architecture & Micro-segmentation", domain: "Security", difficulty: "Advanced",
      description: "Enforce explicit verification, conditional access policies, and continuous trust validation.",
      qs: [
        mcq("What core tenet defines Zero Trust network framework posture?", ["Trust internal subnet traffic", "Never trust, always verify", "Perimeter defense only", "Implicit trust after VPN login"], 1),
        multi("Which are Zero Trust principles?", ["Verify explicitly", "Use least-privilege access", "Assume breach", "Trust everything inside the VPN"], [0, 1, 2]),
        tf("Micro-segmentation limits lateral movement between workloads.", true),
        fill("NIST Special Publication 800-___ defines Zero Trust Architecture.", ["207"])
      ] },
    { id: 24, title: "Module 24: Web Application Security & OWASP Top 10", domain: "Security", difficulty: "Intermediate",
      description: "Mitigate SQL Injection, Cross-Site Scripting (XSS), CSRF attacks, and broken access controls.",
      qs: [
        mcq("Which attack vector involves injecting malicious client scripts into web application output pages?", ["SQL Injection", "XSS (Cross-Site Scripting)", "Buffer Overflow", "Man-in-the-Middle"], 1),
        match("Match each vulnerability to its primary defense.", [["SQL Injection", "Parameterized queries"], ["XSS", "Context-aware output encoding"], ["CSRF", "Anti-CSRF tokens"], ["Broken access control", "Server-side authorization checks"]]),
        tf("Client-side input validation alone is enough to stop SQL injection.", false),
        fill("XSS stands for Cross-Site ___ .", ["scripting"])
      ] },
    { id: 25, title: "Module 25: Network Firewalls & IDS/IPS Systems", domain: "Security", difficulty: "Intermediate",
      description: "Configure stateful packet filtering, deep packet inspection, and signature intrusion detection.",
      qs: [
        mcq("What is the key functional difference between an IDS and an IPS system?", ["IDS actively blocks, IPS only alerts", "IPS actively blocks inline, IDS only alerts", "IDS operates at Layer 7 only", "IPS works without signatures"], 1),
        tf("A stateful firewall tracks connections and automatically allows the return traffic.", true),
        multi("Which are IDS/IPS detection methods?", ["Signature-based", "Anomaly-based", "Stateful protocol analysis", "Random packet guessing"], [0, 1, 2]),
        fill("Most firewall ACLs end with an implicit ___ rule.", ["deny", "deny all", "deny any"])
      ] },
    { id: 26, title: "Module 26: Endpoint Detection & Response (EDR)", domain: "Security", difficulty: "Intermediate",
      description: "Monitor behavioral endpoint telemetry, memory threats, automated response scripts, and isolation.",
      qs: [
        mcq("What telemetry focus sets EDR solutions apart from legacy signature Antivirus tools?", ["Real-time process behavior execution", "File size checksums only", "Scheduled weekly scans", "Static hash tables"], 0),
        tf("EDR tools can remotely isolate a compromised endpoint from the network.", true),
        multi("Which data do EDR agents typically collect?", ["Process creation events", "Network connections", "File and registry changes", "Users' personal email passwords"], [0, 1, 2]),
        fill("XDR extends EDR across more data sources; the X stands for ___ .", ["extended"])
      ] },
    { id: 27, title: "Module 27: Cloud Security Posture Management (CSPM)", domain: "Security", difficulty: "Advanced",
      description: "Automate compliance scanning, configuration drift mitigation, and public bucket exposures.",
      qs: [
        mcq("What primary task does a CSPM security tool perform across cloud accounts?", ["Encrypting local disk RAM", "Detecting cloud misconfigurations & drift", "Speeding up DNS response time", "Load balancing HTTP requests"], 1),
        multi("Which are typical CSPM findings?", ["A publicly readable storage bucket", "SSH open to 0.0.0.0/0", "An unencrypted database", "A well-commented source file"], [0, 1, 2]),
        tf("CSPM tools mainly scan application source code for bugs.", false),
        match("Match each cloud security tool category to its focus.", [["CSPM", "Cloud misconfigurations"], ["CWPP", "Workload runtime protection"], ["CASB", "Controlling SaaS usage"], ["CIEM", "Cloud identity entitlements"]])
      ] },
    { id: 28, title: "Module 28: SIEM Data Logging & SOC Operations", domain: "Security", difficulty: "Intermediate",
      description: "Aggregate syslog telemetry, perform correlation rules, SOC alert triage, and threat hunting.",
      qs: [
        mcq("Which process standardizes disparate log formats into unified SIEM searchable events?", ["Encryption", "Normalization", "Hashing", "Obfuscation"], 1),
        order("Put the SIEM pipeline stages in order.", ["Collect logs from sources", "Parse & normalize events", "Correlate with detection rules", "Raise an alert", "Analyst triage"]),
        tf("SOAR platforms automate incident response playbooks.", true),
        fill("The standard logging protocol that traditionally uses UDP port 514 is ___ .", ["syslog"])
      ] },
    { id: 29, title: "Module 29: Vulnerability Management & Scanning", domain: "Security", difficulty: "Beginner",
      description: "Discover unpatched CVE software flaws, score CVSS severity metrics, and manage patch life cycles.",
      qs: [
        mcq("What standard numerical metric rates security vulnerability severity from 0.0 to 10.0?", ["CVE", "CVSS Score", "ISO 27001", "NIST CSF"], 1),
        match("Match each term to its meaning.", [["CVE", "Unique ID for a specific vulnerability"], ["CVSS", "Severity score from 0 to 10"], ["CWE", "Category of software weakness"], ["KEV", "CISA list of actively exploited flaws"]]),
        order("Order the vulnerability management lifecycle.", ["Discover assets", "Scan for vulnerabilities", "Prioritize by risk", "Remediate / patch", "Verify the fix"]),
        tf("A CVSS v3 score of 9.5 is rated Critical.", true)
      ] },
    { id: 30, title: "Module 30: Incident Response & Digital Forensics", domain: "Security", difficulty: "Advanced",
      description: "Follow NIST incident lifecycle steps: Preparation, Detection, Containment, Eradication, Recovery.",
      qs: [
        mcq("What is the critical first priority step when a compromised host actively spreads malware?", ["Format system disk", "Containment / Network Isolation", "Write post-incident report", "Notify media"], 1),
        order("Arrange the incident response steps in order.", ["Preparation", "Detection & analysis", "Containment", "Eradication", "Recovery", "Lessons learned"]),
        tf("You should power off a compromised machine immediately to preserve evidence in memory.", false),
        fill("Documenting who handled evidence, and when, is called the chain of ___ .", ["custody"])
      ] },
    { id: 31, title: "Module 31: API Security & OAuth 2.0 / OIDC", domain: "Security", difficulty: "Advanced",
      description: "Secure REST services with Bearer JWT tokens, scopes, rate limiting, and authorization flows.",
      qs: [
        mcq("Which OAuth 2.0 token grant flow is standard for web application user authentication?", ["Authorization Code Flow", "Implicit Flow", "Resource Owner Password", "Client Credentials"], 0),
        match("Match each credential to its job.", [["Access token", "Calls the protected API"], ["Refresh token", "Obtains new access tokens"], ["ID token (OIDC)", "Carries user identity claims"], ["Client secret", "Authenticates the application"]]),
        tf("PKCE protects the Authorization Code flow for public clients such as mobile apps.", true),
        multi("Which are good API security practices?", ["Rate limiting", "Validating JWT signature and expiry", "Scoping tokens to least privilege", "Passing API keys in URL query strings"], [0, 1, 2])
      ] },
    { id: 32, title: "Module 32: Penetration Testing Methodology", domain: "Security", difficulty: "Intermediate",
      description: "Execute reconnaissance, threat scanning, exploitation phase, privilege escalation, and reporting.",
      qs: [
        mcq("In security testing, what term describes a test where the team receives zero prior system details?", ["White-Box Test", "Black-Box Test", "Gray-Box Test", "Audit Test"], 1),
        order("Put the penetration test phases in order.", ["Reconnaissance", "Scanning & enumeration", "Exploitation", "Privilege escalation", "Reporting"]),
        match("Match each test style to its description.", [["White-box", "Full knowledge of the system"], ["Gray-box", "Partial knowledge, e.g. a user account"], ["Black-box", "No prior knowledge"], ["Red team", "Goal-based adversary emulation"]]),
        tf("A penetration test should start only after written authorization and an agreed scope.", true)
      ] },
    { id: 33, title: "Module 33: Compliance Frameworks (NIST, ISO, SOC2)", domain: "Security", difficulty: "Beginner",
      description: "Map technical controls to regulatory audit requirements, data privacy (GDPR), and risk registers.",
      qs: [
        mcq("Which security compliance certification focuses on cloud service provider trust principles?", ["PCI-DSS", "SOC 2 Type II", "HIPAA", "FERPA"], 1),
        match("Match each framework to what it covers.", [["PCI DSS", "Payment card data"], ["HIPAA", "US health information"], ["GDPR", "EU personal data privacy"], ["ISO 27001", "Information security management system"]]),
        tf("A SOC 2 Type II report evaluates controls over a period of time, not at a single point.", true),
        multi("Which are core functions of NIST CSF 2.0?", ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover", "Monetize"], [0, 1, 2, 3, 4, 5])
      ] }
  ];

  return { TYPE_LABEL, TYPE_HINT, MODULES: MODULES_DATA };
})();

const PA = {
  modules: PRACTICE_BANK.MODULES,
  byId: new Map(PRACTICE_BANK.MODULES.map(m => [m.id, m])),
  TYPE_LABEL: PRACTICE_BANK.TYPE_LABEL,
  TYPE_HINT: PRACTICE_BANK.TYPE_HINT,
  PASS_RATIO: 0.75,
  EXAM_PASS: 70,
  PER_PAGE: 8,
  DOMAINS: ["Networking", "Cloud", "Security"],
  DOMAIN_CHIP: { Networking: "chip-blue", Cloud: "chip-cyan", Security: "chip-purple" }
};
PA.total = PA.modules.reduce((n, m) => n + m.qs.length, 0);

/* ---------- shared question engine ---------- */
function paPerm(n, seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const p = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  if (n > 1 && p.every((v, i) => v === i)) p.push(p.shift());
  return p;
}
const paNorm = s => String(s).toLowerCase().replace(/\s+/g, " ").trim();
function paInitResp(q, modId, qi) {
  if (q.t === "multi") return [];
  if (q.t === "order") return paPerm(q.o.length, modId * 97 + qi * 13 + 1);
  if (q.t === "match") return q.p.map(() => -1);
  if (q.t === "fill") return "";
  return null;
}
function paAnswered(q, r) {
  switch (q.t) {
    case "mcq": return r !== null && r !== undefined;
    case "tf": return typeof r === "boolean";
    case "multi": return Array.isArray(r) && r.length > 0;
    case "fill": return typeof r === "string" && r.trim() !== "";
    case "order": return Array.isArray(r);
    case "match": return Array.isArray(r) && r.every(x => x >= 0);
  }
  return false;
}
function paGrade(q, r) {
  if (!paAnswered(q, r)) return false;
  switch (q.t) {
    case "mcq": case "tf": return r === q.a;
    case "multi": return r.length === q.a.length && q.a.every(i => r.includes(i));
    case "fill": return q.a.some(a => paNorm(a) === paNorm(r));
    case "order": case "match": return r.every((v, i) => v === i);
  }
  return false;
}
function paAnswerText(q) {
  switch (q.t) {
    case "mcq": return q.o[q.a];
    case "tf": return q.a ? "True" : "False";
    case "multi": return q.a.map(i => q.o[i]).join(", ");
    case "fill": return q.a[0];
    case "order": return q.o.join(" → ");
    case "match": return q.p.map(([l, r]) => `${l} → ${r}`).join("; ");
  }
  return "";
}
function paRespText(q, r) {
  if (!paAnswered(q, r) && q.t !== "order") return "Not answered";
  switch (q.t) {
    case "mcq": return q.o[r];
    case "tf": return r ? "True" : "False";
    case "multi": return r.map(i => q.o[i]).join(", ");
    case "fill": return r;
    case "order": return r.map(i => q.o[i]).join(" → ");
    case "match": return q.p.map(([l], i) => `${l} → ${q.p[r[i]][1]}`).join("; ");
  }
  return "";
}
/* Returns the new response after a click/input inside a question, or undefined if nothing changed */
function paApply(q, r, el, kind) {
  if (kind === "pick") return q.t === "tf" ? el.dataset.v === "true" : +el.dataset.v;
  if (kind === "toggle-multi") { const v = +el.dataset.v, n = [...r], at = n.indexOf(v); at >= 0 ? n.splice(at, 1) : n.push(v); return n; }
  if (kind === "move") { const pos = +el.dataset.pos, to = pos + +el.dataset.dir, n = [...r]; if (to < 0 || to >= n.length) return; [n[pos], n[to]] = [n[to], n[pos]]; return n; }
  if (kind === "fill") return el.value;
  if (kind === "match") { const n = [...r]; n[+el.dataset.row] = +el.value; return n; }
}
function paInputHTML(q, r, modId, qi, { reveal = false, locked = false } = {}) {
  const dis = locked ? "disabled" : "";
  const ok = reveal && paGrade(q, r);
  if (q.t === "mcq" || q.t === "tf") {
    const opts = q.t === "tf" ? [["True", true], ["False", false]] : q.o.map((o, i) => [o, i]);
    return `<div class="q-opts ${q.t === "tf" ? "pa-tf" : ""}" role="radiogroup">${opts.map(([label, val], i) => {
      let cls = r === val ? "sel" : "";
      if (reveal) cls = val === q.a ? "right" : (r === val ? "wrong" : "");
      const k = q.t === "tf" ? (val ? "T" : "F") : String.fromCharCode(65 + i);
      return `<button type="button" class="q-opt ${cls}" role="radio" aria-checked="${r === val}" data-pq="pick" data-v="${val}" ${dis}><span class="k">${k}</span><span class="pa-grow">${esc(label)}</span>${reveal && val === q.a ? icon("check", "icon pa-ok") : reveal && r === val ? icon("x", "icon pa-bad") : ""}</button>`;
    }).join("")}</div>`;
  }
  if (q.t === "multi") {
    return `<div class="q-opts">${q.o.map((o, i) => {
      const sel = r.includes(i), isA = q.a.includes(i);
      let cls = sel ? "sel" : "", tag = "";
      if (reveal) { cls = isA && sel ? "right" : isA ? "missed" : sel ? "wrong" : ""; tag = isA && !sel ? `<span class="xs pa-ok">missed</span>` : ""; }
      return `<button type="button" class="q-opt ${cls}" role="checkbox" aria-checked="${sel}" data-pq="toggle-multi" data-v="${i}" ${dis}><span class="k pa-box">${sel ? icon("check", "icon") : ""}</span><span class="pa-grow">${esc(o)}</span>${tag}</button>`;
    }).join("")}</div>`;
  }
  if (q.t === "fill") {
    const cls = reveal ? (ok ? "pa-right" : "pa-wrong") : "";
    return `<input type="text" class="input pa-fill ${cls}" data-pq-in="fill" value="${esc(r)}" placeholder="Type your answer" autocomplete="off" spellcheck="false" aria-label="Your answer" ${dis}><p class="xs dim">Not case-sensitive. Press Enter to submit.</p>`;
  }
  if (q.t === "order") {
    return `<ol class="pa-order">${r.map((it, pos) => `<li class="${reveal ? (it === pos ? "pa-right" : "pa-wrong") : ""}"><span class="mono xs dim">${pos + 1}</span><span class="pa-grow">${esc(q.o[it])}</span>
      <button type="button" class="pa-icon-btn" data-pq="move" data-pos="${pos}" data-dir="-1" aria-label="Move up" ${locked || pos === 0 ? "disabled" : ""}>${icon("up")}</button>
      <button type="button" class="pa-icon-btn" data-pq="move" data-pos="${pos}" data-dir="1" aria-label="Move down" ${locked || pos === r.length - 1 ? "disabled" : ""}>${icon("down")}</button></li>`).join("")}</ol>`;
  }
  if (q.t === "match") {
    const perm = paPerm(q.p.length, modId * 131 + qi * 7 + 3);
    return `<div class="pa-match">${q.p.map(([left], row) => `<div class="pa-match-row ${reveal ? (r[row] === row ? "pa-right" : "pa-wrong") : ""}">
      <span class="pa-match-l">${esc(left)}</span>
      <select class="pa-sel" data-pq-in="match" data-row="${row}" aria-label="Match for ${esc(left)}" ${dis}><option value="-1" ${r[row] < 0 ? "selected" : ""}>Choose…</option>${perm.map(j => `<option value="${j}" ${r[row] === j ? "selected" : ""}>${esc(q.p[j][1])}</option>`).join("")}</select>
      ${reveal && r[row] !== row ? `<span class="xs pa-ok pa-fix">Correct: ${esc(q.p[row][1])}</span>` : ""}</div>`).join("")}</div>`;
  }
  return "";
}
const paTypeChip = q => `<span class="chip chip-cyan">${PA.TYPE_LABEL[q.t]}</span>`;
const paDomainChip = d => `<span class="chip ${PA.DOMAIN_CHIP[d] || ""}">${esc(d)}</span>`;
const paFmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------- topic practice state ---------- */
const paProg = () => store.get("practice:progress", {});
function paModProg(all, id) { return all[id] || (all[id] = { qi: 0, view: "quiz", resp: {}, res: {} }); }
function paStats(m, all = paProg()) {
  const p = all[m.id], res = p ? p.res : {};
  const checked = Object.keys(res).length, correct = Object.values(res).filter(Boolean).length;
  let status = checked ? "progress" : "new";
  if (checked === m.qs.length) status = correct >= Math.ceil(m.qs.length * PA.PASS_RATIO) ? "passed" : "retry";
  return { checked, correct, status };
}

route("/practice", () => {
  const mode = qparam("mode") === "exam" ? "exam" : "topics";
  return {
    title: "Practice Arena",
    desc: "Practice Arena — topic-wise practice questions and timed mock exams for networking, cloud and cybersecurity, with six question types and instant feedback.",
    html: pageHead("Practice Arena", "Mock tests that get you <span class=\"grad-text\">exam-ready.</span>", `${PA.total} practice questions across ${PA.modules.length} topics in six formats — multiple choice, true/false, multi-select, fill in the blank, ordering and matching. Practise topic by topic, then sit a timed mock exam.`, [["Home", "/"], ["Practice Arena", ""]]) + `
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap stack" style="gap:20px">
 <div class="grid g4 pa-stats" id="paStats"></div>
 <div class="row between">
  <div class="tab-row" role="group" aria-label="Practice mode">
   <button type="button" data-mode="topics" aria-pressed="${mode === "topics"}">${icon("book", "icon", 'style="width:15px;height:15px;vertical-align:-2px"')} Topic practice</button>
   <button type="button" data-mode="exam" aria-pressed="${mode === "exam"}">${icon("clock", "icon", 'style="width:15px;height:15px;vertical-align:-2px"')} Mock exam</button>
  </div>
  <button type="button" class="btn btn-quiet btn-sm" id="paReset">${icon("reset")}Reset progress</button>
 </div>
 <div id="paPane"></div>
</div></section>`,
    init: root => {
      const pane = $("#paPane", root);
      const ui = { mode, domain: "All", diff: "All", status: "All", q: "", page: 1, open: +qparam("m") || null };
      if (ui.open && !PA.byId.has(ui.open)) ui.open = null;

      const setUrl = () => { const p = "/practice" + (ui.mode === "exam" ? "?mode=exam" : ""); try { history.replaceState(null, "", "#" + p); } catch {} curPath = p; };
      const switchMode = m => { ui.mode = m; $$("[data-mode]", root).forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m)); setUrl(); paintPane(); };
      $$("[data-mode]", root).forEach(b => b.onclick = () => switchMode(b.dataset.mode));
      $("#paReset", root).onclick = async () => {
        if (!await confirmDialog({ title: "Reset practice progress?", body: "This clears your topic answers, mock exam history and any exam in progress on this device.", confirm: "Reset", danger: true })) return;
        ["practice:progress", "practice:exams", "practice:active"].forEach(k => store.del(k));
        paintStats(); paintPane(); toast("Practice progress reset");
      };

      function paintStats() {
        const all = paProg(); let passed = 0, correct = 0;
        PA.modules.forEach(m => { const s = paStats(m, all); if (s.status === "passed") passed++; correct += s.correct; });
        const exams = store.get("practice:exams", []);
        const best = exams.length ? Math.max(...exams.map(e => e.pct)) + "%" : "—";
        $("#paStats", root).innerHTML = [
          ["Topics passed", `${passed}/${PA.modules.length}`],
          ["Questions correct", `${correct}/${PA.total}`],
          ["Best mock score", best],
          ["Mock exams taken", exams.length]
        ].map(([l, v]) => `<div class="card stat" style="padding:18px"><span>${l}</span><b>${v}</b></div>`).join("") +
          `<div class="progress pa-overall" style="grid-column:1/-1" aria-label="Overall progress"><i style="width:${(correct / PA.total) * 100}%"></i></div>`;
      }
      function paintPane() { clearInterval(PA.timer); ui.mode === "exam" ? paintExam() : paintTopics(); }

      /* ===== Topic practice ===== */
      function filtered() {
        const all = paProg(), q = paNorm(ui.q);
        return PA.modules.filter(m => (ui.domain === "All" || m.domain === ui.domain) && (ui.diff === "All" || m.difficulty === ui.diff) &&
          (ui.status === "All" || paStats(m, all).status === ui.status) && (!q || paNorm(m.title + " " + m.description).includes(q)));
      }
      function paintTopics() {
        pane.innerHTML = `
          <div class="card pa-filters">
            <div class="tab-row" role="group" aria-label="Domain">${["All", ...PA.DOMAINS].map(d => `<button type="button" data-dom="${d}" aria-pressed="${ui.domain === d}">${d === "All" ? "All domains" : d}</button>`).join("")}</div>
            <div class="pa-filter-row">
              <div class="field pa-grow"><label for="paQ">Search topics</label><input class="input" id="paQ" type="search" placeholder="e.g. subnetting, Kubernetes, OAuth" value="${esc(ui.q)}"></div>
              <div class="field"><label for="paDiff">Difficulty</label><select class="input" id="paDiff">${["All", "Beginner", "Intermediate", "Advanced"].map(v => `<option value="${v}" ${ui.diff === v ? "selected" : ""}>${v === "All" ? "All levels" : v}</option>`).join("")}</select></div>
              <div class="field"><label for="paStatus">Status</label><select class="input" id="paStatus">${[["All", "All statuses"], ["new", "Not started"], ["progress", "In progress"], ["passed", "Passed"], ["retry", "Needs retry"]].map(([v, l]) => `<option value="${v}" ${ui.status === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
            </div>
          </div>
          <div class="pa-list" id="paList"></div>
          <div class="row between" id="paPager"></div>`;
        $$("[data-dom]", pane).forEach(b => b.onclick = () => { ui.domain = b.dataset.dom; ui.page = 1; $$("[data-dom]", pane).forEach(x => x.setAttribute("aria-pressed", x === b)); paintList(); });
        $("#paQ", pane).oninput = e => { ui.q = e.target.value; ui.page = 1; paintList(); };
        $("#paDiff", pane).onchange = e => { ui.diff = e.target.value; ui.page = 1; paintList(); };
        $("#paStatus", pane).onchange = e => { ui.status = e.target.value; ui.page = 1; paintList(); };
        if (ui.open) { const i = filtered().findIndex(m => m.id === ui.open); if (i >= 0) ui.page = Math.floor(i / PA.PER_PAGE) + 1; }
        paintList();
        wireTopicEvents($("#paList", pane));
        if (ui.open) { const c = $(`.pa-mod[data-id="${ui.open}"]`, pane); if (c) setTimeout(() => c.scrollIntoView({ block: "start", behavior: "smooth" }), 60); }
      }
      function paintList() {
        const list = filtered(), pages = Math.max(1, Math.ceil(list.length / PA.PER_PAGE));
        ui.page = Math.min(ui.page, pages);
        const items = list.slice((ui.page - 1) * PA.PER_PAGE, ui.page * PA.PER_PAGE);
        $("#paList", pane).innerHTML = items.length ? items.map(modHTML).join("")
          : `<div class="empty">${icon("search")}<strong>No topics match your filters.</strong><span class="small">Try a different domain, level, status or search term.</span></div>`;
        $("#paPager", pane).innerHTML = `<button type="button" class="btn btn-ghost btn-sm" data-pg="-1" ${ui.page <= 1 ? "disabled" : ""}>${icon("left")}Previous</button><span class="small muted">Page ${ui.page} of ${pages} · ${list.length} topics</span><button type="button" class="btn btn-ghost btn-sm" data-pg="1" ${ui.page >= pages ? "disabled" : ""}>Next${icon("arrow")}</button>`;
        $$("[data-pg]", pane).forEach(b => b.onclick = () => { ui.page += +b.dataset.pg; paintList(); $("#paList", pane).scrollIntoView({ block: "start", behavior: "smooth" }); });
        paintStats();
      }
      function modHTML(m) {
        const all = paProg(), s = paStats(m, all), p = all[m.id], open = ui.open === m.id;
        const status = { new: "", progress: `<span class="chip chip-warn">${s.correct}/${m.qs.length} · in progress</span>`, passed: `<span class="chip chip-ok">${icon("check", "icon", 'style="width:12px;height:12px"')}Passed ${s.correct}/${m.qs.length}</span>`, retry: `<span class="chip chip-bad">Retry ${s.correct}/${m.qs.length}</span>` }[s.status];
        const dots = m.qs.map((_, i) => `<i class="${p && p.res[i] === true ? "ok" : p && p.res[i] === false ? "bad" : ""}"></i>`).join("");
        return `<article class="pa-mod ${open ? "open" : ""}" data-id="${m.id}">
          <button type="button" class="pa-mod-head" data-act="toggle" aria-expanded="${open}">
            <span class="mod-num mono">${String(m.id).padStart(2, "0")}</span>
            <span class="pa-grow stack" style="gap:6px"><span class="pa-mod-title">${esc(m.title.replace(/^Module \d+:\s*/, ""))}</span>
              <span class="row" style="gap:6px">${paDomainChip(m.domain)}${levelChip(m.difficulty)}<span class="xs dim mono">${m.qs.length} questions</span><span class="pa-dots" aria-hidden="true">${dots}</span>${status}</span></span>
            ${icon("chev", "icon pa-chev")}
          </button>
          ${open ? `<div class="pa-mod-body"><p class="small muted">${esc(m.description)}</p>${(p && p.view === "summary") ? summaryHTML(m) : quizHTML(m)}</div>` : ""}
        </article>`;
      }
      function quizHTML(m) {
        const all = paProg(), p = paModProg(all, m.id);
        if (p.qi < 0 || p.qi >= m.qs.length) p.qi = 0;
        const qi = p.qi, q = m.qs[qi], r = p.resp[qi] !== undefined ? p.resp[qi] : paInitResp(q, m.id, qi);
        const checked = p.res[qi] !== undefined, last = qi === m.qs.length - 1;
        const steps = m.qs.map((_, i) => `<button type="button" class="pa-step ${i === qi ? "cur" : ""} ${p.res[i] === true ? "ok" : p.res[i] === false ? "bad" : ""}" data-act="goto" data-q="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`).join("");
        const fb = !checked ? "" : p.res[qi]
          ? `<div class="alert alert-ok">${icon("check")}<div><strong>Correct!</strong> ${last ? "Open your results to finish this topic." : "Move on to the next question."}</div></div>`
          : `<div class="alert alert-bad">${icon("alert")}<div><strong>Not quite.</strong> Correct answer: ${esc(paAnswerText(q))}</div></div>`;
        const main = !checked ? `<button type="button" class="btn btn-primary btn-sm" data-act="check" ${paAnswered(q, r) ? "" : "disabled"}>Check answer</button>`
          : last ? `<button type="button" class="btn btn-primary btn-sm" data-act="finish">See results${icon("arrow")}</button>`
          : `<button type="button" class="btn btn-primary btn-sm" data-act="next">Next question${icon("arrow")}</button>`;
        return `<div class="pa-quiz quiz" data-ctx="topic">
          <div class="row between"><div class="row" style="gap:6px">${steps}</div><span class="xs dim mono">Question ${qi + 1} of ${m.qs.length}</span></div>
          <div class="row" style="gap:8px">${paTypeChip(q)}<span class="xs dim">${PA.TYPE_HINT[q.t]}</span></div>
          <h4 class="pa-q">${esc(q.q)}</h4>
          ${paInputHTML(q, r, m.id, qi, { reveal: checked, locked: checked })}
          ${fb}
          <div class="row between">
            <div class="row" style="gap:6px"><button type="button" class="btn btn-ghost btn-sm" data-act="prev" ${qi === 0 ? "disabled" : ""}>${icon("left")}Previous</button>
            ${checked && !p.res[qi] ? `<button type="button" class="btn btn-quiet btn-sm" data-act="retry-q">${icon("reset")}Try again</button>` : ""}</div>
            <div class="row" style="gap:6px">${!checked && !last ? `<button type="button" class="btn btn-quiet btn-sm" data-act="next">Skip</button>` : ""}${main}</div>
          </div></div>`;
      }
      function summaryHTML(m) {
        const all = paProg(), p = all[m.id], s = paStats(m, all), need = Math.ceil(m.qs.length * PA.PASS_RATIO), left = m.qs.length - s.checked;
        const verdict = s.status === "passed" ? `<div class="alert alert-ok">${icon("award")}<div><strong>Topic passed.</strong> You answered ${s.correct} of ${m.qs.length} correctly.</div></div>`
          : left ? `<div class="alert alert-warn">${icon("info")}<div><strong>${left} question${left > 1 ? "s" : ""} still unanswered.</strong> Answer them all to complete the topic — ${need} correct needed to pass.</div></div>`
          : `<div class="alert alert-bad">${icon("alert")}<div><strong>Not passed yet.</strong> You need ${need} of ${m.qs.length}. Review your misses and retry.</div></div>`;
        return `<div class="pa-quiz quiz">
          <div class="row" style="align-items:baseline;gap:10px"><b class="pa-score">${s.correct}/${m.qs.length}</b><span class="small muted">correct</span></div>
          ${verdict}
          <ul class="pa-review">${m.qs.map((q, i) => `<li>${p.res[i] === true ? icon("check", "icon pa-ok") : p.res[i] === false ? icon("x", "icon pa-bad") : `<span class="dim">–</span>`}<span><span class="xs dim mono">Q${i + 1} · ${PA.TYPE_LABEL[q.t]}</span><br>${esc(q.q)}</span></li>`).join("")}</ul>
          <div class="row"><button type="button" class="btn btn-ghost btn-sm" data-act="review">Review answers</button><button type="button" class="btn btn-quiet btn-sm" data-act="retry-mod">${icon("reset")}Retry topic</button><span class="pa-grow"></span><button type="button" class="btn btn-primary btn-sm" data-act="next-mod">Next topic${icon("arrow")}</button></div>
        </div>`;
      }
      function repaintMod(id, focusSel) {
        const card = $(`.pa-mod[data-id="${id}"]`, pane); if (!card) return paintList();
        const tmp = document.createElement("div"); tmp.innerHTML = modHTML(PA.byId.get(id)); const fresh = tmp.firstElementChild;
        card.replaceWith(fresh); paintStats();
        if (focusSel) { const el = $(focusSel, fresh); if (el) el.focus(); }
      }
      function wireTopicEvents(listEl) {
        const ctx = el => { const card = el.closest(".pa-mod"); if (!card) return null; const m = PA.byId.get(+card.dataset.id); const all = paProg(); const p = paModProg(all, m.id); return { m, all, p, q: m.qs[p.qi], save: () => store.set("practice:progress", all) }; };
        const curResp = c => c.p.resp[c.p.qi] !== undefined ? c.p.resp[c.p.qi] : paInitResp(c.q, c.m.id, c.p.qi);
        listEl.addEventListener("click", e => {
          const el = e.target.closest("[data-act],[data-pq]"); if (!el || el.disabled) return;
          const c = ctx(el); if (!c) return;
          const { m, p } = c, id = m.id;
          if (el.dataset.pq) {
            const n = paApply(c.q, curResp(c), el, el.dataset.pq); if (n === undefined) return;
            p.resp[p.qi] = n; c.save();
            return repaintMod(id, el.dataset.pq === "move" ? `[data-pq="move"][data-pos="${+el.dataset.pos + +el.dataset.dir}"][data-dir="${el.dataset.dir}"]:not(:disabled)` : null);
          }
          switch (el.dataset.act) {
            case "toggle": {
              const prev = ui.open; ui.open = ui.open === id ? null : id;
              if (prev && prev !== id) repaintMod(prev);
              repaintMod(id);
              if (ui.open) { const card = $(`.pa-mod[data-id="${id}"]`, pane); const top = card.getBoundingClientRect().top; if (top < 70) card.scrollIntoView({ block: "start", behavior: "smooth" }); }
              return;
            }
            case "check": { const r = curResp(c); if (!paAnswered(c.q, r)) return; p.resp[p.qi] = r; p.res[p.qi] = paGrade(c.q, r); c.save(); return repaintMod(id, `[data-act="next"].btn-primary,[data-act="finish"],[data-act="retry-q"]`); }
            case "retry-q": delete p.res[p.qi]; delete p.resp[p.qi]; break;
            case "next": if (p.qi < m.qs.length - 1) p.qi++; break;
            case "prev": if (p.qi > 0) p.qi--; break;
            case "goto": p.qi = +el.dataset.q; p.view = "quiz"; break;
            case "finish": p.view = "summary"; break;
            case "review": p.view = "quiz"; p.qi = 0; break;
            case "retry-mod": c.all[id] = { qi: 0, view: "quiz", resp: {}, res: {} }; break;
            case "next-mod": {
              const list = filtered(), i = list.findIndex(x => x.id === id), nx = list[i + 1] || list[0];
              if (!nx || nx.id === id) break;
              ui.open = nx.id; ui.page = Math.floor(list.indexOf(nx) / PA.PER_PAGE) + 1; paintList();
              const card = $(`.pa-mod[data-id="${nx.id}"]`, pane); if (card) card.scrollIntoView({ block: "start", behavior: "smooth" });
              return;
            }
            default: return;
          }
          c.save(); repaintMod(id);
        });
        listEl.addEventListener("input", e => {
          const el = e.target; if (el.dataset.pqIn !== "fill") return;
          const c = ctx(el); c.p.resp[c.p.qi] = el.value; c.save();
          const b = $('[data-act="check"]', el.closest(".pa-mod")); if (b) b.disabled = !el.value.trim();
        });
        listEl.addEventListener("change", e => {
          const el = e.target; if (el.dataset.pqIn !== "match") return;
          const c = ctx(el); const n = paApply(c.q, curResp(c), el, "match"); c.p.resp[c.p.qi] = n; c.save();
          const b = $('[data-act="check"]', el.closest(".pa-mod")); if (b) b.disabled = !paAnswered(c.q, n);
        });
        listEl.addEventListener("keydown", e => {
          if (e.key !== "Enter" || e.target.dataset.pqIn !== "fill") return;
          e.preventDefault(); const b = $('[data-act="check"]', e.target.closest(".pa-mod")); if (b && !b.disabled) b.click();
        });
      }

      /* ===== Mock exam ===== */
      const getActive = () => store.get("practice:active", null);
      const setActive = a => a ? store.set("practice:active", a) : store.del("practice:active");
      const examQ = ([mid, qi]) => PA.byId.get(mid).qs[qi];
      const examResp = (ex, i) => { const it = ex.items[i]; return ex.resp[i] !== undefined ? ex.resp[i] : paInitResp(examQ(it), it[0], it[1]); };
      const remaining = ex => ex.limit ? Math.max(0, Math.round(ex.limit - (Date.now() - ex.started) / 1000)) : null;

      function paintExam() {
        const ex = getActive();
        if (ex && ex.done) return paintResult(ex);
        if (ex) return paintRunning(ex);
        paintSetup();
      }
      function paintSetup() {
        const hist = store.get("practice:exams", []);
        const pool = d => PA.modules.filter(m => d === "All" || m.domain === d).reduce((n, m) => n + m.qs.length, 0);
        pane.innerHTML = `<div class="grid pa-exam-grid">
          <div class="card stack" style="gap:20px">
            <div class="row"><span class="icon-box">${icon("clock")}</span><div><h3>Start a mock exam</h3><p class="small muted">Random questions, no hints until you submit — just like the real thing.</p></div></div>
            <div class="stack" style="gap:8px"><span class="small" style="color:#CBD5E1;font-weight:500">Domain</span>
              <div class="tab-row" role="group" aria-label="Exam domain" id="exDom">${["All", ...PA.DOMAINS].map((d, i) => `<button type="button" data-v="${d}" aria-pressed="${i === 0}">${d === "All" ? "All domains" : d} <span class="xs dim">${pool(d)}</span></button>`).join("")}</div></div>
            <div class="stack" style="gap:8px"><span class="small" style="color:#CBD5E1;font-weight:500">Number of questions</span>
              <div class="tab-row" role="group" aria-label="Number of questions" id="exN">${[10, 20, 30].map((n, i) => `<button type="button" data-v="${n}" aria-pressed="${i === 1}">${n} questions</button>`).join("")}</div></div>
            <div class="stack" style="gap:8px"><span class="small" style="color:#CBD5E1;font-weight:500">Timer</span>
              <div class="tab-row" role="group" aria-label="Timer" id="exT">${[["1", "Timed · 1 min per question"], ["0", "Untimed"]].map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div></div>
            <div class="callout"><h4>Exam rules</h4><p class="small muted">Answers are saved as you go and you can jump between questions or flag them for review. Results, explanations and a domain breakdown appear after you submit. Pass mark: ${PA.EXAM_PASS}%.</p></div>
            <div><button type="button" class="btn btn-primary btn-lg" id="exStart">${icon("play")}Start mock exam</button></div>
          </div>
          <div class="card stack" style="gap:14px">
            <h4>Recent attempts</h4>
            ${hist.length ? `<ul class="pa-hist">${hist.slice(0, 8).map(h => `<li><span class="chip ${h.pct >= PA.EXAM_PASS ? "chip-ok" : "chip-bad"}">${h.pct}%</span><span class="pa-grow small">${esc(h.domain === "All" ? "All domains" : h.domain)} · ${h.n} Qs<br><span class="xs dim">${fmtDT(h.date)} · ${paFmtTime(h.secs)}</span></span></li>`).join("")}</ul>`
              : `<div class="empty" style="padding:28px 16px">${icon("award")}<span class="small">No attempts yet. Your scores will appear here.</span></div>`}
          </div></div>`;
        const pick = id => { const g = $("#" + id, pane); $$("button", g).forEach(b => b.onclick = () => $$("button", g).forEach(x => x.setAttribute("aria-pressed", x === b))); };
        ["exDom", "exN", "exT"].forEach(pick);
        $("#exStart", pane).onclick = () => {
          const val = id => $(`#${id} [aria-pressed="true"]`, pane).dataset.v;
          const domain = val("exDom"), timed = val("exT") === "1";
          const all = []; PA.modules.forEach(m => { if (domain === "All" || m.domain === domain) m.qs.forEach((_, qi) => all.push([m.id, qi])); });
          const order = paPerm(all.length, Date.now() % 2147483647);
          const n = Math.min(+val("exN"), all.length);
          const items = order.slice(0, n).map(i => all[i]);
          setActive({ items, resp: {}, flags: {}, idx: 0, started: Date.now(), limit: timed ? n * 60 : 0, domain });
          paintExam();
          $("#paPane", root).scrollIntoView({ block: "start", behavior: "smooth" });
        };
      }
      function paintRunning(ex) {
        const i = ex.idx, it = ex.items[i], q = examQ(it), m = PA.byId.get(it[0]), r = examResp(ex, i);
        const isDone = k => ex.resp[k] !== undefined && paAnswered(examQ(ex.items[k]), ex.resp[k]);
        const answeredN = ex.items.filter((_, k) => isDone(k)).length;
        const left = remaining(ex);
        pane.innerHTML = `<div class="grid pa-exam-grid">
          <div class="card stack" style="gap:18px">
            <div class="row between"><span class="xs mono dim">Question ${i + 1} of ${ex.items.length}</span>
              ${left !== null ? `<span class="chip ${left < 60 ? "chip-bad" : "chip-cyan"} mono" id="exClock">${icon("clock", "icon", 'style="width:13px;height:13px"')}${paFmtTime(left)}</span>` : `<span class="chip mono">Untimed</span>`}</div>
            <div class="progress"><i style="width:${((i + 1) / ex.items.length) * 100}%"></i></div>
            <div class="row" style="gap:6px">${paTypeChip(q)}${paDomainChip(m.domain)}<span class="xs dim">${esc(m.title.replace(/^Module \d+:\s*/, ""))}</span></div>
            <h4 class="pa-q">${esc(q.q)}</h4>
            <p class="xs dim" style="margin-top:-8px">${PA.TYPE_HINT[q.t].replace(", then press Enter or Check answer", "")}</p>
            <div id="exQ">${paInputHTML(q, r, it[0], it[1])}</div>
            <div class="row between">
              <div class="row" style="gap:6px"><button type="button" class="btn btn-ghost btn-sm" data-ex="prev" ${i === 0 ? "disabled" : ""}>${icon("left")}Previous</button>
                <button type="button" class="btn btn-quiet btn-sm" data-ex="flag" aria-pressed="${!!ex.flags[i]}">${icon("bookmark")}${ex.flags[i] ? "Flagged" : "Flag for review"}</button></div>
              ${i < ex.items.length - 1 ? `<button type="button" class="btn btn-primary btn-sm" data-ex="next">Save &amp; next${icon("arrow")}</button>` : `<button type="button" class="btn btn-primary btn-sm" data-ex="submit">Submit exam${icon("check")}</button>`}
            </div>
          </div>
          <div class="card stack" style="gap:14px">
            <div class="row between"><h4>Question map</h4><span class="xs dim">${answeredN}/${ex.items.length} answered</span></div>
            <div class="pa-map">${ex.items.map((_, k) => { const a = isDone(k); return `<button type="button" class="pa-step ${k === i ? "cur" : ""} ${a ? "done" : ""} ${ex.flags[k] ? "flag" : ""}" data-ex="goto" data-k="${k}" aria-label="Question ${k + 1}${a ? ", answered" : ""}${ex.flags[k] ? ", flagged" : ""}">${k + 1}</button>`; }).join("")}</div>
            <div class="row xs dim" style="gap:12px"><span><i class="pa-key done"></i>Answered</span><span><i class="pa-key flag"></i>Flagged</span><span><i class="pa-key"></i>Not answered</span></div>
            <button type="button" class="btn btn-ghost btn-sm" data-ex="submit">Submit exam</button>
            <button type="button" class="btn btn-quiet btn-sm" data-ex="quit">${icon("x")}Abandon exam</button>
          </div></div>`;

        const save = () => setActive(ex);
        const qBox = $("#exQ", pane);
        const redrawQ = focusSel => { qBox.innerHTML = paInputHTML(q, examResp(ex, i), it[0], it[1]); if (focusSel) { const el = $(focusSel, qBox); if (el) el.focus(); } };
        qBox.onclick = e => { const el = e.target.closest("[data-pq]"); if (!el || el.disabled) return; const n = paApply(q, examResp(ex, i), el, el.dataset.pq); if (n === undefined) return; ex.resp[i] = n; save(); redrawQ(el.dataset.pq === "move" ? `[data-pq="move"][data-pos="${+el.dataset.pos + +el.dataset.dir}"][data-dir="${el.dataset.dir}"]:not(:disabled)` : null); };
        qBox.oninput = e => { if (e.target.dataset.pqIn === "fill") { ex.resp[i] = e.target.value; save(); } };
        qBox.onchange = e => { if (e.target.dataset.pqIn === "match") { ex.resp[i] = paApply(q, examResp(ex, i), e.target, "match"); save(); } };
        qBox.onkeydown = e => { if (e.key === "Enter" && e.target.dataset.pqIn === "fill") { e.preventDefault(); const b = $('[data-ex="next"],[data-ex="submit"]', pane); b && b.click(); } };
        $$("[data-ex]", pane).forEach(b => b.onclick = async () => {
          const a = b.dataset.ex;
          if (q.t === "order" && ex.resp[i] === undefined && (a === "next" || a === "submit")) ex.resp[i] = examResp(ex, i);
          if (a === "prev") ex.idx--;
          else if (a === "next") ex.idx++;
          else if (a === "goto") ex.idx = +b.dataset.k;
          else if (a === "flag") ex.flags[i] = !ex.flags[i];
          else if (a === "quit") { if (!await confirmDialog({ title: "Abandon this exam?", body: "Your answers for this attempt will be discarded and it won't be scored.", confirm: "Abandon", danger: true })) return; setActive(null); return paintExam(); }
          else if (a === "submit") {
            const un = ex.items.filter((_, k) => !isDone(k)).length;
            if (!await confirmDialog({ title: "Submit your exam?", body: un ? `${un} question${un > 1 ? "s are" : " is"} still unanswered and will be marked wrong.` : "You have answered every question.", confirm: "Submit" })) return;
            return finishExam(ex);
          }
          save(); paintRunning(ex);
        });
        if (left !== null) {
          clearInterval(PA.timer);
          PA.timer = setInterval(() => {
            const clk = document.getElementById("exClock");
            if (!clk) return clearInterval(PA.timer);
            const s = remaining(ex);
            clk.lastChild.textContent = paFmtTime(s);
            clk.classList.toggle("chip-bad", s < 60); clk.classList.toggle("chip-cyan", s >= 60);
            if (s <= 0) { clearInterval(PA.timer); toast("Time's up — your exam was submitted", "info"); finishExam(ex); }
          }, 1000);
        }
      }
      function finishExam(ex) {
        clearInterval(PA.timer);
        const correct = ex.items.filter((it, k) => paGrade(examQ(it), ex.resp[k])).length;
        const pct = Math.round((correct / ex.items.length) * 100);
        const secs = Math.round(Math.min(ex.limit || Infinity, (Date.now() - ex.started) / 1000));
        Object.assign(ex, { done: true, correct, pct, secs });
        setActive(ex);
        const hist = store.get("practice:exams", []);
        hist.unshift({ date: new Date().toISOString(), domain: ex.domain, n: ex.items.length, correct, pct, secs });
        store.set("practice:exams", hist.slice(0, 20));
        paintStats(); paintResult(ex);
        $("#paPane", root).scrollIntoView({ block: "start", behavior: "smooth" });
      }
      function paintResult(ex) {
        const passed = ex.pct >= PA.EXAM_PASS;
        const breakdown = (keyFn, labelFn) => { const g = {}; ex.items.forEach((it, k) => { const key = keyFn(it); g[key] = g[key] || [0, 0]; g[key][1]++; if (paGrade(examQ(it), ex.resp[k])) g[key][0]++; }); return Object.entries(g).map(([k, [c, t]]) => `<div class="stack" style="gap:6px"><div class="row between small"><span>${labelFn(k)}</span><span class="mono">${c}/${t}</span></div><div class="progress"><i style="width:${(c / t) * 100}%;${c / t < 0.7 ? "background:var(--warn)" : ""}"></i></div></div>`).join(""); };
        pane.innerHTML = `<div class="stack" style="gap:20px">
          <div class="card pa-result">
            <div class="stack" style="gap:10px">
              <span class="eyebrow">Mock exam result</span>
              <div class="row" style="align-items:baseline;gap:12px"><b class="pa-score pa-score-lg">${ex.pct}%</b><span class="chip ${passed ? "chip-ok" : "chip-bad"}">${passed ? "Passed" : "Below pass mark"}</span></div>
              <p class="muted small">${ex.correct} of ${ex.items.length} correct · ${esc(ex.domain === "All" ? "All domains" : ex.domain)} · time ${paFmtTime(ex.secs)} · pass mark ${PA.EXAM_PASS}%</p>
              <div class="row"><button type="button" class="btn btn-primary btn-sm" data-r="new">${icon("reset")}New mock exam</button><button type="button" class="btn btn-ghost btn-sm" data-r="topics">${icon("book")}Practise weak topics</button></div>
            </div>
            <div class="stack" style="gap:12px"><h4>By domain</h4>${breakdown(it => PA.byId.get(it[0]).domain, k => esc(k))}</div>
            <div class="stack" style="gap:12px"><h4>By question type</h4>${breakdown(it => examQ(it).t, k => PA.TYPE_LABEL[k])}</div>
          </div>
          <div class="card stack" style="gap:14px">
            <div class="row between"><h4>Answer review</h4><div class="tab-row" role="group" aria-label="Review filter" id="rvF"><button type="button" data-v="all" aria-pressed="true">All</button><button type="button" data-v="wrong" aria-pressed="false">Incorrect only</button></div></div>
            <ol class="pa-rv-list" id="rvList">${ex.items.map((it, k) => { const q = examQ(it), r = ex.resp[k], ok = paGrade(q, r), m = PA.byId.get(it[0]);
              return `<li class="pa-rv ${ok ? "" : "is-wrong"}"><div class="row between"><span class="row" style="gap:6px"><span class="mono xs dim">Q${k + 1}</span>${paTypeChip(q)}${paDomainChip(m.domain)}</span>${ok ? `<span class="chip chip-ok">${icon("check", "icon", 'style="width:12px;height:12px"')}Correct</span>` : `<span class="chip chip-bad">Incorrect</span>`}</div>
                <p class="pa-q" style="font-size:var(--t-base)">${esc(q.q)}</p>
                <p class="small"><span class="dim">Your answer:</span> <span class="${ok ? "pa-ok" : "pa-bad"}">${esc(paRespText(q, r === undefined ? paInitResp(q, it[0], it[1]) : r))}</span></p>
                ${ok ? "" : `<p class="small"><span class="dim">Correct answer:</span> <span class="pa-ok">${esc(paAnswerText(q))}</span></p>`}
                <a class="xs" href="#/practice?m=${m.id}">Practise “${esc(m.title.replace(/^Module \d+:\s*/, ""))}” →</a></li>`; }).join("")}</ol>
          </div></div>`;
        $$("[data-r]", pane).forEach(b => b.onclick = () => { setActive(null); if (b.dataset.r === "topics") { ui.status = "All"; switchMode("topics"); } else paintExam(); });
        $$("#rvF button", pane).forEach(b => b.onclick = () => { $$("#rvF button", pane).forEach(x => x.setAttribute("aria-pressed", x === b)); $("#rvList", pane).classList.toggle("only-wrong", b.dataset.v === "wrong"); });
        $$("#rvList a", pane).forEach(a => a.onclick = e => { e.preventDefault(); setActive(null); ui.open = +a.getAttribute("href").split("m=")[1]; ui.domain = "All"; ui.diff = "All"; ui.status = "All"; ui.q = ""; switchMode("topics"); });
      }

      paintStats();
      paintPane();
    }
  };
}, { auth: "student" });
