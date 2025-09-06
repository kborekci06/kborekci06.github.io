---
layout: page
title: Diaphragm Control Device
permalink: /projects/diaphragm-control/
---

# Diaphragm Control Device (Patent Pending, BMES 2025)

**Role:** Firmware & PCB • **Stack:** Embedded C (I²C, UART, SPI), SD logging, GPIO diagnostics • **Hardware:** custom PCB  
**Domain:** Pediatric Congenital Central Hypoventilation Syndrome

<!-- Optional hero image -->
<!-- ![](/assets/images/diaphragm-hero.jpg){: width="780" } -->

## Overview
First-step **data-collection platform** toward a closed-loop biofeedback model for **diaphragm pacer regulation** in pediatric patients. Designed for clinical data capture to inform normative models and future controller development.

## My Contributions
- Programmed firmware in **Embedded C** to interface **IMU (I²C)** and **CO₂ sensor (UART)**, manage **SD logging (SPI)**, and implement **GPIO-based diagnostics** and UX.
- Designed a **custom PCB** to consolidate sensors, power management, and storage; achieved **20+ hours** of runtime in field testing.
- Established robust on-device logging schema and timestamps for downstream modeling.

## Recognition & Status
- **Selected for presentation at BMES 2025 (San Diego).**
- **Patent application** and **manuscript** in progress.
- Certain implementation details are **withheld pending IP clearance**.

## System Snapshot
- **uC:** Raspberry Pi Pico class MCU (C SDK)  
- **Buses:** I²C (IMU), UART (CO₂), SPI (SD)  
- **Power:** optimized for extended runtime; low-power modes for idle windows  
- **Data:** synchronized IMU/CO₂ packets with integrity checks

## Next Steps
- Healthy-cohort data collection to build **normative model**  
- Handoff for integration into a **closed-loop controller** prototype

> Interested in the firmware/PCB design? I can discuss the architecture at a high level now, and share more details **post-clearance or under NDA**.
