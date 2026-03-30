---
layout: page
title: ""
permalink: /projects/cfd-lung/
---
## Analysis of Aerosol Deposition in a Simplified 2D Tracheobronchial Tree Model
#### ME 378: Computational Fluid Dynamics | ANSYS Fluent | 3-Person Team

{% include tag-row.html slug="cfd-lung" %}

### Project Summary
This project quantified and compared the airflow dynamics and local deposition efficiency of inhaled microparticles (1 µm, 10 µm, and 100 µm) in a simplified, 2D symmetric airway model spanning generations 0 through 6, built using Weibel's empirically measured lung morphometry. The simulation evaluated how unsteady, sinusoidal breathing alters boundary layer separation and inertial impaction compared to standard steady-state approximations, using ANSYS Fluent's Discrete Phase Model with Lagrangian particle tracking.

### My Contributions
This was a three-person team project in which I took primary ownership of the steady-state technical content. Out of 27 substantive sections in the final report, I authored or led the following:

| Domain | Sections |
|---|---|
| **Geometry and assumptions** | Designed the full 2D symmetric airway geometry in ANSYS DesignModeler using Weibel's Model (G0–G6, 35° half-angle bifurcations). Defined all general, steady-state, and transient assumptions. |
| **Flow characterization** | Calculated Reynolds number range (Re = 2704, transitional regime), characterized steady-state flow features (stagnation points, boundary layer separation, recirculation zones), and established baseline expectations for particle behavior. |
| **Discrete Phase Model theory** | Derived and documented the Lagrangian force balance (drag, gravity/buoyancy), particle relaxation time, Stokes number calculations for all three particle sizes, and the Discrete Random Walk turbulence dispersion model (100 DRW tries per Sturm's findings). |
| **Boundary conditions and mesh** | Defined all fluid and particle boundary conditions (outflow weighting by generation, wall trap conditions). Generated three structured meshes for the Grid Independence Study with inflation layers (10 layers, 1.2 growth rate), achieving y+ < 1 on all meshes for the SST k-ω low-Re turbulence model. |
| **Results and verification** | Ran and analyzed all steady-state particle deposition cases on the fine mesh (500 streams, 100 DRW tries, 50,000 parcels). Conducted the 12-point parcel independence study and the full GCI grid independence analysis using Çelik et al.'s procedure. |
| **References** | Located and compiled 15 of 16 references used in the report. |

### Key results
Deposition results spanned three orders of magnitude consistent with Stokes number predictions: 1 µm particles (Stk = 4×10⁻⁴) passed through with 0.03% deposition, 10 µm particles (Stk = 4×10⁻²) deposited at 20.69% with a distributed pattern peaking at Generation 4, and 100 µm particles (Stk = 4.07) deposited at 100%. Transient sinusoidal breathing introduced exhalation-driven particle reversal that increased deposition opportunity for mid-range particles, while inertia-dominated 100 µm particles were unaffected by the flow reversal. The 2D model successfully captured relative deposition trends compared to 3D literature values, though absolute magnitudes were higher due to the absence of out-of-plane secondary flows.

{% include media-3up.html
  class="w-75"
  a_src="assets/img/projects/cfd-lung/1micron2.mp4"
  a_poster="assets/img/projects/cfd-lung/1micron2.mp4"
  a_caption="1 µm particles (Stk = 4×10⁻⁴): follow streamlines, negligible deposition (0.03%)."
  b_src="assets/img/projects/cfd-lung/10micron_2x.mp4"
  b_poster="assets/img/projects/cfd-lung/10micron_2x.mp4"
  b_caption="10 µm particles (Stk = 4×10⁻²): distributed deposition across generations, 20.69% trapped."
  c_src="assets/img/projects/cfd-lung/100micron2.mp4"
  c_poster="assets/img/projects/cfd-lung/100micron2.mp4"
  c_caption="100 µm particles (Stk = 4.07): inertia dominates, 100% deposition at the carina."
%}


### Full report
<object data="/assets/img/projects/cfd-lung/03_15-FINAL-REPORT.pdf#view=FitH" type="application/pdf" width="100%" height="900">
  <iframe src="/assets/img/projects/cfd-lung/03_15-FINAL-REPORT.pdf#view=FitH" width="50%" height="900" style="border:0;">
    <p>Inline PDF viewer unavailable in this browser. 
       <a href="/assets/img/projects/cfd-lung/03_15-FINAL-REPORT.pdf" target="_blank" rel="noopener">Open PDF in a new tab</a>.
    </p>
  </iframe>
</object>

<script src="{{ '/assets/js/viewport-autoplay.js' | relative_url }}"></script>