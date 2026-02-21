---
layout: page
title: BioNexus
permalink: /projects/bionexus/
---

<h1>A Non-Invasive, Modular, Multi-System Medical Device</h1>


## Motive
Data collection in the field of medical technologies usually involves one of the following:

(1)	Professional Diagnosis
(2)	Academic/Clinical Research

In both cases, data are typically acquired in controlled environments that do not capture the complex, dynamic interactions and stimuli of everyday life. Traditional clinical instruments are often evaluated one measure at a time under structured conditions rather than continuously monitoring multiple physiological signals in uncontrolled settings, limiting ecological validity and real-world applicability for longitudinal health monitoring. Even in systems designed for simultaneous data acquisition — such as Body Area Networks (BANs) — devices tend to be specialized for narrow applications, with limited modularity and few market-ready, consumer-oriented implementations.

Although constraints such as weight, power consumption, connectivity, and cost contribute to these limitations, broader challenges remain. Limited flexibility, comfort, and ease of use inhibit the synchronous deployment of multiple devices outside controlled settings, including point-of-care and consumer environments. At the same time, demand for self-monitoring health technologies has grown rapidly over the past decade, with consumer wearables such as Fitbit, Apple Watch, and the ŌURA Ring dominating the market and enabling continuous, real-world physiological data collection. Moreover, wearable data quality varies across device types and sensor locations, and without standardized contexts or clinical calibration, these measurements cannot yet replace gold-standard medical diagnostics or be natively integrated into physics-informed models of biomechanics and bioelectronics required to robustly interpret nonlinear, multi-system human physiology. 



## Proposition
I propose a noninvasive, multi-device Body Area Network (BAN) system based on a hub-and-spoke architecture that synchronously collects heterogeneous physiological and bioelectric signals from the human body in real time. The system is designed to support applications spanning clinical research, point-of-care monitoring, and closed-loop control of external devices such as robotic or prosthetic limbs, as well as future implant-assisted systems, through real-time biomedical control signals integrated with physics-informed and machine learning-based models.

The primary novelty of this project lies in its modular hardware and communication architecture, enabled by Ultra-Wideband (UWB)-based inter-device communication. Each sensing node functions as a swappable module, allowing different modalities (e.g., EMG, EEG, EKG) to be interchanged without firmware modification, while a scalable software framework enables the seamless addition of multiple spoke devices to expand the range of captured physiological data. UWB communication further provides time-of-flight (ToF)–based depth information, introducing a spatial and temporal sensing dimension that is critical for physiologically and physically informed inference.



<div class="text-narrow">
  <p>By combining bioelectric signals (EMG, EKG, EEG), physiological measurements (e.g., exhaled CO2, pulse), inertial sensing (IMUs), and UWB-derived depth information — augmented with synchronous video-based pose estimation — the proposed system enables a comprehensive, multimodal representation of human state and behavior. This integrated sensing framework supports a wide range of biomedical applications, including fitness and health monitoring, clinical diagnostics, translational research, physics- and physiology-informed machine learning, adaptive therapy and implant regulation, robotic and prosthetic limb control, and even select applications in defense and human-performance systems.</p>
</div>

## System Diagram
The high level system architecture is as such: A spoke module will consist of an MCU, IMU, UWB, and a specific sensor, i.e. EMG, EKG, EEG, CO2, SpO2, Non-invasive CGM... The spoke module will be named by the sensor it has such as "EMG Spoke". The spoke may also have a BLE unit, µSD unit, USB port etc. in case of UWB communication failure as fallback. The important feature of the spoke architecture is that the specific sensor will be swappable, therefore I propose a multi-layer design; for instance for bioelectric sensors like EMG/EEG/EKG there may be 3 layers, the electrode, the analog front end (AFE) layer (consisting of amplifiers, analog filters, ADC), and the digital layer (IMU, UWB, MCU, Wireless Charging electronics). The AFE layer can be swapped based on whether an EMG/EEG/EKG is used. The data will primarily be sent to the hub module through UWB unless failure. The data sent will be the timestamp, IMU data (6 or 9 axis), distance measurement through time of flight, and spoke-specific sensor. The hub module will consist of an MCU, UWB, Raspberry Pi 5 Compute Module, Video Camera connected to the Pi 5, and perhaps even an AI accelerator (NPU) module for real-time pose estimation. The hub MCU will run RTOS and control all the spoke devices, maintaining sensor fusion through preventing many spokes from interfering while collecting near-simultaneous to simultaneous data from multiple spokes. The MCU will get the data from its own UWB sensor. Then after coordinating and receiving the data, it will send it to the Raspberry Pi 5 computer running Linux. The Pi 5 will also be collecting video data of the person, synched with the data from the spokes; furthermore, through the NPU, the Pi 5 may even perform real-time pose estimation which will allow for kinematic/dynamic models in combination with IMU and UWB distance data. Finally, the Raspberry Pi 5 will send all the data to a self-developed app for displaying. The app should be able to visualize the data clearly, and also store the data received locally as a .csv/.txt file. The app should also be able to see the system spoke modules pairing with the hub, notify the user of any errors, and even send commands like configurations (like limiting the IMU register to send only accelerometer data, change sensitivity of a sensor, start/stop data collection...) back that will reach the hub MCU.

{% include media-figure.html
  class="w-90"
  src="/assets/img/projects/bionexus/system-diagram.png"
  caption="BioNexus System Diagram."
%}