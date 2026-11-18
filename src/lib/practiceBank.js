/* Practice Arena question bank — converted to an ES module. */
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

export default PRACTICE_BANK;
