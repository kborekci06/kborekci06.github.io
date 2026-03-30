---
layout: page
title: ""
permalink: /projects/diaphragm-control/
---
### Building the foundation for closed-loop diaphragm pacing through a portable IMU-CO₂ platform for pediatric CCHS
{% include tag-row.html slug="diaphragm-control" %}



<div class="split">
  <div class="split__text">
  <div>
    <strong><h4>Table of contents</h4></strong>
    <ul>
      <li><a href="#project-overview">Project Overview</a></li>
      <li><a href="#problem">Problem</a></li>
      <li><a href="#constraints">Constraints</a></li>
      <li><a href="#approach-and-methodology">Approach and Methodology</a>
        <ul>
          <li><a href="#system-architecture-and-component-selection">System Architecture and Component Selection</a></li>
          <li><a href="#firmware-architecture">Firmware Architecture</a></li>
          <li><a href="#patient-interface-and-enclosure">Patient Interface and Enclosure</a></li>
          <li><a href="#data-pipeline-and-output">Data Pipeline and Output</a></li>
        </ul>
      </li>
      <li><a href="#hardware-subsystem-iterations-and-prototyping">Hardware Subsystem Iterations and Prototyping</a>
        <ul>
          <li><a href="#v1---circuit-playground-express-proof-of-concept">v1 - Circuit Playground Express: Proof of Concept</a></li>
          <li><a href="#v2---component-selection-and-breadboard-firmware-development">v2 - Component Selection and Breadboard Firmware Development</a></li>
          <li><a href="#v3---solder-board-interim-save">v3 - Solder Board Interim Save</a></li>
          <li><a href="#v4---through-hole-pcb-current-device-in-use">v4 - Through-Hole PCB: Current Device in Use</a></li>
        </ul>
      </li>
      <li><a href="#current-status">Current Status</a>
        <ul>
          <li><a href="#formal-irb-approved-data-collection-for-prospective-publication">Formal, IRB Approved Data Collection for Prospective Publication</a></li>
        </ul>
      </li>
      <li><a href="#biomedical-engineering-society-2025-san-diego-ca-poster-presentation">BMES 2025 Poster Presentation</a></li>
    </ul>
  </div>
  </div>
  <div class="split__media split__media--right split__media--vcenter">
    {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs1.png" caption="<strong>Image 1:</strong> Front and Back View of The Through-Hole PCB: <br> <i>Developed after the failed high-fidelity PCB iteration developed by one of my teammates, to keep data collection and IRB + Patent application processes continuing</i>" %}
  </div>
</div>

<div class="split">
  <div class="split__text">
    <h3>Project Overview</h3>
    <p>I led a four-person engineering team as both <strong>technical and project lead</strong>, owning the hardware, firmware, post-processing and analysis software, and enclosure CAD while directing critical decisions and team prioritization. Our system simultaneously captures motion data through a 6-axis IMU and expired CO₂ through an NDIR gas sensor, and is intended as the foundational step toward achieving a closed-loop diaphragm pacing system, a <strong>"Digital Phrenic Nerve"</strong>, for patients with the rare autonomic nervous system disorder Congenital Central Hypoventilation Syndrome (CCHS). While my responsibilities spanned primarily the full hardware and software stack, my teammates led the data collection protocol, clinical IRB and provisional patent applications, CPAP mask side-sampling and moisture trap design, and conference submissions.
    <br><br>
    CCHS patients who qualify for diaphragm pacing currently rely on the only FDA-approved pacers on the market, which were developed for spinal cord injury patients and assume a sedentary user. Children with CCHS, by contrast, are able to run, jump, and play like any other child; but prior to each physical activity, their pacer settings must be manually adjusted by caregivers based on physician recommendations and clinical experience. Incorrect settings place these children at risk for hypoxia (low-O₂), hypercapnia (high-CO₂), and other severe complications, preventing them from leading normal, high-activity lives.
    <br><br>
    My team's device is designed to collect synchronized respiratory and motion data from healthy populations, enabling downstream predictive model development. The resulting model would serve as a control signal for a closed-loop diaphragm pacer capable of operating independently of constant caregiver intervention.
    </p>
  </div>
  <div class="split__media split__media--right split__media--vcenter">
    {% include timeline.html slug="diaphragm-control" %}
  </div>
</div>


<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs8.png" caption="<strong> Image 2 </strong>: CCHS patients during exercise" %}
      <br><br>
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs9.png" caption="<strong> Image 3 </strong>: Current open loop diaphragm pacer/phrenic nerve stimulator"%}
    </div>
  </div>

<div class="split__text">
  <h3>Problem</h3>
    <p>CCHS is a rare, lifelong disorder of the autonomic nervous system that impairs the body's ability to regulate breathing. Affected individuals exhibit blunted respiratory responses, a diminished ability to adjust ventilation in response to physiological stimuli such as elevated blood CO₂ (hypercapnia). Typically diagnosed in the neonatal period, CCHS requires lifelong artificial ventilation during all sleep, and in more severe cases, both while awake and asleep. For daytime use in ambulatory children, phrenic nerve-diaphragm pacers implanted transthoracically (through the chest) support ventilation by inducing diaphragm contractions, offering affected children freedom of movement during daily activities.
    <br><br>
    Managing these pacers, however, presents its own challenge. To assess respiratory function and guide pacer settings, clinicians rely on exhaled end-tidal CO₂ (EtCO₂), a surrogate marker of respiratory demand, measured alongside patient motion data across varying activity levels. Conventional physiological indicators such as heart rate cannot serve this role because the autonomic nervous system dysfunction that defines CCHS compromises the fidelity of autonomic-mediated signals, making EtCO₂ and direct motion measurement the most dependable metrics available. Yet the equipment required to capture these signals, bulky capnography monitors and large wearable accelerometry systems, remains confined to specialized clinical laboratories. This restricts monitoring to controlled environments and severely limits the volume and diversity of data clinicians can collect from patients living active, everyday lives.
    <br><br>
    The pacers themselves compound the problem. They operate as open-loop systems that rely entirely on caregiver input to set activity-level-specific parameters. Before each change in physical activity, a caregiver must manually adjust the pacer settings based on physician recommendations and clinical experience, with no real-time physiological feedback to confirm whether the adjustment is correct. When settings are wrong, these children cannot modulate their breathing as healthy individuals do, placing them at risk for respiratory acidosis, alkalosis, hypoxia, and hypercapnia. The result is a system that simultaneously limits the child's independence, burdens the caregiver, and lacks the quantifiable, real-time metrics needed to ensure safe ventilation during the physically active lives these children are otherwise capable of living.</p>
  </div>
</div>


### Constraints

| Constraint | Engineering Approach |
|---|---|
| **Timeline risk:** 9-month academic schedule with IRB and provisional patent deadlines tied to data collection. | Parallel-path PCB strategy: initiated a deployment-ready through-hole backup design immediately after the first SMD failure, preserving the project timeline when the second SMD attempt also failed. |
| **Clinical stakeholder requirement:** Physical on-device data storage mandated by Lurie Children's Hospital partners due to prior Bluetooth/Wi-Fi reliability failures and hospital RF interference. | Local CSV output to microSD card with embedded C implementation supporting graceful failure recovery and persistent storage across sessions (up to 100 sequential CSV file writes without SD card removal). |
| **Budget and supply chain:** ~Limited internal BME department funding, no external grants, compounded by Spring 2025 tariff-driven component supply disruptions. | Through-hole PCB with off-the-shelf components (RP2040, NDIR CO₂ sensor, 6-DoF IMU), in-house 3D printing for enclosure. |
| **Data quality:** Clinical-grade data required for IRB-approved trials and downstream predictive model development. | Dual-core RP2040 architecture separating real-time sensor polling from storage writes, time-synchronized CSV output (IMU at 100 Hz, CO₂ at 20 Hz). |
| **Sensing strategy:** Autonomic nervous system dysfunction renders conventional physiological feedback signals (e.g., heart rate, heart rate variability) unreliable in the CCHS population. | System designed around EtCO₂ and 6-DoF inertial measurement as the primary sensing modalities, bypassing autonomic-mediated signals entirely. |
| **CO₂ Waveform integrity:** Patient motion and heavy breathing during high-intensity exercise produce water vapor saturation and movement artifacts that distort the CO₂ waveform. | Side-sampled CPAP tubing with an inline moisture trap to preserve capnography waveform fidelity during physical exertion. |
| **Power and runtime:** 24+ hours of operation required for out-of-clinic monitoring. | Rechargeable Li-ion battery, migration from CircuitPython to embedded C for power efficiency and low-level hardware control. |

<br>

### Approach and Methodology
#### System Architecture and Component Selection
<div class="split">
  <div class="split__text">
    <p>I designed the system around three peripherals, each communicating with the RP2040 microcontroller through a dedicated protocol: a 6-DoF inertial measurement unit (IMU) over I²C, a non-dispersive infrared (NDIR) CO₂ sensor over UART, and a microSD card reader over SPI. This separation of communication buses was a deliberate architectural decision to eliminate cross-talk and timing conflicts between the high-frequency motion data stream and the lower-frequency respiratory data stream.
    <br><br>
    I selected the RP2040 for its dual-core ARM Cortex-M0+ architecture to separate the sensor polling and data storage processes in parallel, as well as its flexibility in GPIO allocation for the user interface components (three indicator LEDs, a piezoelectric buzzer, and two pushbuttons for Start/Stop control). Power delivery and firmware programming are handled through a single USB-C connection, with a lithium-ion battery and onboard recharging module supporting untethered operation for clinical trials.</p>
  </div>

  <div class="split__media split__media--right split__media--vcenter">
    {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs3.png" caption="Image 3: System Block Diagram" %}
  </div>
</div>

IMU selection involved a comparative evaluation my teammate Shael and I conducted across four candidate sensors (MPU6050, LSM6DS0, ICM-20948, and BMI270), tested at both 3.3 V and 5 V supply configurations. The MPU6050 and LSM6DS0 were eliminated for higher power consumption than the BMI270. I ultimately selected the ICM-20948 over the BMI270 because, despite reporting 9-DoF (including magnetometer data not required for this application), its power consumption with all axes active was comparable to the BMI270 collecting only 6-DoF. Analyzing the datasheet confirmed that the magnetometer draws the most power on the ICM-20948, meaning that once configured to collect only the relevant 6-DoF in a future firmware revision, the ICM-20948 would outperform the BMI270 on power efficiency.

The NDIR CO₂ sensor (SprintIR-WF-20) was carried forward from a previous capstone group's validated selection, providing EtCO₂ concentration readings in parts per million at a fixed 20 Hz sampling rate, identical to the clinical capnograph Capnostream™ 35 Lurie Children's Hospital used, sufficient for resolving individual breath cycles and extracting clinically relevant waveform features.


#### Firmware architecture

<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs14.png" caption="<strong>Image 4:</strong> RP2040 Dual-Core Architecture Utilized" %}
    </div>
  </div>
  <div class="split__text">
    <p>I wrote the firmware in embedded C, a decision made after developing an initial prototype in CircuitPython using the Adafruit Circuit Playground Express. While CircuitPython enabled rapid proof-of-concept development on the breadboard, it imposed significant limitations in execution speed, memory efficiency, and hardware access that became untenable as the system's real-time requirements solidified. The migration to C provided direct register-level hardware control, fine-grained power management, and access to interrupt service routines (ISRs) that CircuitPython's abstraction layer could not support.
    <br><br>
    I structured the firmware to exploit the RP2040's dual-core architecture through a deliberate division of labor: Core 0 handles real-time sensor acquisition through timer-driven interrupts (IMU at 100 Hz via hardware alarm, CO₂ at 20 Hz via repeating software timer) and application state management, while Core 1 is dedicated entirely to writing time-synchronized CSV data to the microSD card via SPI. To prevent file I/O from blocking sensor acquisition, I implemented a double-buffer scheme: Core 0 fills one 500-line buffer while Core 1 writes the other to the SD card, swapping on each fill cycle. This separation eliminates the timing jitter that would result from interleaving sensor reads and storage writes on a single core.</p>
  </div>
</div>

<div class="split">
    <div class="split__text">
    <p>The firmware follows a structured state machine. During initialization, all communication protocols (I²C at 400 kHz for the IMU, UART at 9600 baud for the CO₂ sensor, SPI at 31.25 MHz for the SD card) and GPIO peripherals are configured, followed by ISR registration for the stop button with a 50 ms software debounce. The system then attempts to mount the SD card, generates a unique sequential filename, opens a CSV file for logging, and enters a waiting state indicated by all three LEDs illuminating. Pressing the start button initiates data collection, resetting the system clock reference and extinguishing the LEDs. During active collection, the main loop checks for new sensor data, formats each IMU sample as a CSV line (merging the latest CO₂ reading every 5th IMU sample to align the two sampling rates), and toggles the corresponding indicator LED upon each successful read. Pressing the stop button triggers a graceful shutdown sequence: any remaining buffered data is flushed, the file is synced and safely closed, and the SD card is unmounted. Resupplying power resets the system and creates a new CSV file without overwriting previous datasets, supporting up to 100 sequential files per SD card.
    <br><br>
    The code depends on the standard Raspberry Pi Pico SDK libraries for I²C, UART, and SPI initialization, supplemented by one external open-source library (<a href="https://github.com/carlk3/no-OS-FatFS-SD-SDIO-SPI-RPi-Pico">carlk3's SPI/SDIO SD card library built on the FatFs filesystem module</a>) for microSD card write operations.</p>
  </div>
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs13.png" caption="<strong>Image 5:</strong> State Machine Diagram of Firmware Architecture" %}
    </div>
  </div>
</div>



#### Patient interface and enclosure
<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-50" src="assets/img/projects/diaphragm-control/cchs10.png" caption="<strong>Image 6:</strong>  CO₂ Gas Capture Subsystem" %}
      <br><br>
      {% include media-block.html class="w-50" src="assets/img/projects/diaphragm-control/cchs7.png" caption="<strong>Image 7:</strong>  CO₂ Waveform Before and After Side Stream + Moisture Trap" %}
      <br><br>
      {% include media-block.html class="w-50" src="assets/img/projects/diaphragm-control/cchs11.png" caption="<strong>Image 8:</strong> Full System on Healthy Subject <br> <i>Teammate Akash wearing the system for final tests prior to IRB approved data collection for publication</i>" %}
    </div>
  </div>
  <div class="split__text">
    <p>The patient-facing design was developed in close collaboration with Dr. Debra Weese-Mayer and Casey Rand at Lurie Children's Hospital, whose clinical requirements shaped several design decisions throughout this subsystem.
    <br><br>
    The respiratory data collection pathway uses a clinical-grade, non-invasive CPAP mask worn by the patient or healthy subject during a custom exercise protocol designed by my teammate Akash. The protocol is a modified BCCH treadmill procedure structured to specifically capture high-intensity physical activity and the physiological transitions between increasing levels of exertion. During exhalation, a portion of the expired air is diverted through a side-sampling tube to the NDIR CO₂ sensor mounted on the PCB assembly. Drawing on my fluid mechanics and mass transport coursework, I proposed the side-sampling configuration over inline sampling after observing that direct inline flow was causing signal saturation, compounded by elevated water vapor from exertion. Side-sampling creates a stagnation point at the sampling junction that yields a cleaner, more representative CO₂ waveform compared to the turbulent, moisture-laden flow of the inline approach. My teammate Akash then spearheaded the physical implementation of the side-sampling tubing and moisture trap system in response to this architectural change. The inline moisture trap, placed along the sampling path between the mask and the sensor, actively removes humidity from the exhaled air, preventing water vapor condensation from saturating the NDIR optical chamber and distorting the capnography waveform during high-intensity exercise.
    <br><br>
    I designed the enclosure in Onshape, dimensioned to match the PCB footprint with clearances for the USB-C port, LED visibility windows, pushbutton access, and the LiPo battery. The enclosure was 3D printed in-house and mounts to the patient's chest using a commercially available GoPro chest-mount harness, which provided a secure, adjustable attachment point while allowing unrestricted upper-body movement during the treadmill protocol. We collectively selected the chest-mount location to minimize tubing length between the CPAP mask and the CO₂ sensor, reducing transit time and signal latency in the respiratory data.
    </p>
  </div>
</div>


#### Data pipeline and output
The system produces time-synchronized CSV files containing timestamped IMU readings (linear acceleration and angular velocity across three axes at 100 Hz) and CO₂ concentration readings (in parts per million at 20 Hz). The time-synchronization is maintained through the RP2040's hardware timer infrastructure, with both sensor streams referenced to a common system clock that resets upon each start-button press.
<br><br>
I selected the CSV format for its universal compatibility with downstream analysis tools (Python, MATLAB, Excel) and its transparency for clinical partners who needed to inspect raw data without specialized software. Each file is self-contained and sequentially numbered, enabling clinicians to run multiple trial sessions without physically removing or reformatting the SD card between runs. I wrote the post-processing and analysis software in Python, performing basic signal conditioning including filtering and feature extraction of clinically relevant parameters such as EtCO₂ peak concentration, breathing rate, and 6-axis acceleration magnitude across the exercise protocol phases.
<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs12.png" caption="<strong>Image 9:</strong> Our team's custom treadmill protocol <br> <i>(Pre-Rest, 2mph, 4mph, 6mph, 8mph, Post-Rest)</i> <br> Respectively: <i>CO₂ Response, Accelerometer, and Gyroscope Subplots</i>"%}
    </div>
  </div>

  <div class="split__text">
    <p>Meanwhile, my teammates Akash and Jay led the development of the data collection protocol, including a <strong><i>modified</i></strong> <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5530101/">BCCH treadmill procedure</a> <u>(rest, increasing intensity in 2 mph increments up to 8 mph or volitional fatigue, followed by cooldown)</u>, which defined the exercise structure under which the device captures its synchronized datasets. This specialized protocol was designed to produce clear, graduated transitions between activity levels, making the relationship between physical exertion and the corresponding CO₂ response significantly easier to isolate and characterize. The existing clinical COOKIES standard serves a different purpose, focused on routine monitoring of CCHS patients rather than generating the structured activity-to-CO₂ mappings required for predictive model development. Our modified protocol addresses this gap by capturing well-defined transitions between discrete exertion states, producing training data with clear input-output boundaries that will prove essential for downstream development of the motion-to-EtCO₂ predictive model underpinning the closed-loop pacing vision.</p>
  </div>
</div>

### Hardware Subsystem Iterations and Prototyping

The hardware path to a working clinical device was neither linear nor predictable. What began as a proof-of-concept on a development board evolved through five iterations over three academic quarters (~7 months), shaped by component failures, funding constraints, and the pragmatic reality of needing a working device on a deadline.

#### v1 - Circuit Playground Express: Proof of Concept

<div class="split">
  <div class="split__text">
    <p><br><br><br>The first iteration used an Adafruit Circuit Playground Express with its onboard IMU, with the SprintIR CO₂ sensor soldered directly to the UART RX/TX pins. Running in CircuitPython, this minimal configuration was sufficient to validate the project's core hypothesis: that there is a measurable change in CO₂ waveform characteristics in response to increased physical activity. The data confirmed that as activity intensified, CO₂ waveform frequency increased while amplitude decreased, providing the clinical team with early evidence that the motion-to-CO₂ relationship was observable with portable instrumentation. This proof-of-concept gave us confidence to invest in a purpose-built platform.</p>
  </div>

  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-40" src="assets/img/projects/diaphragm-control/cchs15.png" caption="<strong>Image 10:</strong> Hardware v1 - Circuit Playground Express Dev Board"%}
    </div>
  </div>
</div>

#### v2 - Component Selection and Breadboard Firmware Development

<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs16.png" caption="<strong>Image 11:</strong> Hardware v2 - Breadboard Firmware Development <br><i>All sensor drivers and the dual-core architecture were developed and validated on this configuration</i>"%}
    </div>
  </div>

  <div class="split__text">
    <p>With the concept validated, Shael and I conducted the component selection for the MCU and IMU. We selected the RP2040 (Raspberry Pi Pico) for its dual-core architecture, extensive online documentation, and a VS Code-compatible SDK that simplified the development environment. The IMU selection process, detailed in the System Architecture section above, involved comparative power testing across four candidate sensors.
    <br><br>
    I then began developing the embedded C firmware on a breadboard while Shael simultaneously began designing the first PCB in Eagle. We were both taking EE 326 (Electronic System Design) that quarter, learning PCB design for the first time. The firmware development on the breadboard took several weeks, including a three-week debugging effort on the SD card library integration. The root cause turned out to be a storage capacity requirement in the FatFs library: the SD card needed to be larger than 16 GB, and I had been testing with a smaller card. This was undocumented in the library and required methodical elimination of every other possible failure point before the issue surfaced.</p>
  </div>
</div>

#### v3 - Solder Board Interim Save
The PCB and components arrived just days before our 2nd Quarter BME capstone final presentation. When Shael finished soldering the first SMD board, it would not power on. With no functional PCB and only a fragile breadboard prototype, I decided to build a solder-board version to present a durable, portable device. I constructed a two-story stacked solder-board structure that functioned as an attachment shield, carefully cutting and routing wires to create a robust design. For power, I repurposed a spare MCU development board from the Mechatronics shop that had a LiPo battery socket, giving the system untethered operation. The result was bulky but fully functional, and it helped us collect data as well as perform a live demo for our presentation.

<div class="split">
  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs17.png" caption="<strong>Image 12a:</strong> Hardware v3 - Solder Board Save Prior to Final Presentation<br><i>Assembled View</i>"%}
    </div>
  </div>

  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-50" src="assets/img/projects/diaphragm-control/cchs18.png" caption="<strong>Image 12b:</strong> Hardware v3 - Solder Board Save Prior to Final Presentation<br><i>Disassembled View</i>"%}
    </div>
  </div>
</div>

<div class="media-block {{ include.class | default: '' }}">
  {% include media-block.html class="w-100" src="assets/img/projects/diaphragm-control/cchs5.png" caption="<strong>Image 13:</strong> Failed High-Fidelity, SMD PCB #1, Developed by Teammate"%}
</div>

#### v4 - Through-Hole PCB: Current Device in Use

<div class="split">
  <div class="split__text">
    <p>During the spring break week between our 2nd academic quarter of BME Capstone and our voluntary 3rd quarter extension, I designed a through-hole PCB as a parallel-path strategy to ensure we could begin data collection immediately when the new quarter started. The design used the same RP2040 architecture and sensor stack but specified through-hole components for reliable hand assembly, eliminating the soldering difficulties that contributed to the SMD failures. The board was fabricated, assembled, and validated before Capstone 3 began, giving us a deployment-ready device on day one of the quarter.
    <br><br>
    This decision proved critical. Shael's second iteration of the high-fidelity SMD PCB also did not succeed after 12+ weeks of development. Compounding the situation, economic tariffs imposed during Spring 2025 coincided with a federal funding freeze at the university, which halted BME departmental funding and made it difficult to order additional PCB iterations. Because the through-hole board was already operational, the team was able to proceed with IRB applications, the BMES conference submission, the provisional patent filing, and clinical data collection without interruption. We decided not to pursue a third SMD attempt given the funding constraints and instead focused resources on the regulatory and clinical milestones that the working device now enabled.
    <br><br>
    The through-hole PCB remains the production board in active use today, over a year after its initial design, collecting data for the team's ongoing publication efforts.</p>
  </div>

  <div class="split__media split__media--right split__media--vcenter">
    <div class="media-block {{ include.class | default: '' }}">
      {% include media-block.html class="w-75" src="assets/img/projects/diaphragm-control/cchs4.png" caption="<strong>Image 14:</strong> Hardware v4 - Through-hole PCB designed in one week during spring break<br><i>This board has been the production platform for all clinical data collection and is still in active use</i>"%}
    </div>
  </div>
</div>

### Current Status:
#### Formal, IRB Approved Data Collection for Prospective Publication
The device is now being used in IRB-approved formal data collection on healthy college-age individuals <i>without</i> CCHS. These subjects serve as the baseline population for establishing the motion-to-CO₂ relationship in individuals with normally functioning phrenic nerves and autonomic regulation. The resulting dataset is intended for use by downstream research groups/BME Capstone teams in developing the predictive model that would ultimately serve as the control signal for a closed-loop diaphragm pacer. Our forthcoming publication will focus on the device platform itself, its clinical data collection capabilities, and the roadmap toward closed-loop pacing, rather than on the predictive model, which represents a subsequent phase of the research with a larger population.

<div class="media-block {{ include.class | default: '' }}">
    {% include media-block.html class="w-100" src="assets/img/projects/diaphragm-control/cchs12.png" caption="<strong>Image 9:</strong> Results from final treadmill run prior to IRB approved data collection <br> <i>Pre-Rest, 2mph, 4mph, 6mph, 8mph, Post-Rest</i> <br> Respectively: <i>CO₂ Response, Accelerometer, and Gyroscope Subplots</i>"%}
</div>

### Biomedical Engineering Society 2025 (San Diego, CA) Poster Presentation

<object data="/assets/img/projects/diaphragm-control/BMES-POSTER-2025.pdf#view=FitH" type="application/pdf" width="100%" height="900">
  <iframe src="/assets/img/projects/diaphragm-control/BMES-POSTER-2025.pdf#view=FitH" width="100%" height="900" style="border:0;">
    <p>Inline PDF viewer unavailable in this browser. 
       <a href="/assets/img/projects/diaphragm-control/BMES-POSTER-2025.pdf" target="_blank" rel="noopener">Open PDF in a new tab</a>.
    </p>
  </iframe>
</object>

{% include link-list.html slug="diaphragm-control" %}

<!-- ## Timeline:
{% include timeline.html slug="robotic-manipulation" %} -->