# CHAPTER 1: THEORIES AND TECHNOLOGIES

This chapter establishes the theoretical and engineering foundations required to understand the **DeepGuard** platform and its core detector, **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT). Following the structure of an applied engineering thesis, the chapter proceeds from the *outer* technologies that wrap the system into a usable product towards the *inner* scientific machinery that gives it its discriminative power. We begin with the web stack that the user actually touches — JavaScript, Next.js, FastAPI, the HTTP API contract, and DNS — then move to the AI building blocks of the detector — EfficientNet-B4, the Discrete Cosine Transform and frequency analysis, attention and fusion — and from there to the *domain* itself — how deepfakes are made, why detecting them across datasets is hard, what the eKYC context demands, and how a secondary liveness module fits. The chapter closes with the cloud-deployment technologies (AWS) and a summary. The guiding philosophy throughout is didactic: present the intuition first, then the formula; anchor each idea to a figure or table; and close each subsection with a one-line takeaway.

## 1.1 JavaScript

JavaScript is a high-level, dynamically typed programming language that is the lingua franca of the web browser. Where HTML describes the *structure* of a page and CSS its *appearance*, JavaScript supplies its *behaviour*: it runs inside every modern browser and lets a page react to the user — responding to clicks, validating a form before it is sent, fetching data without a full page reload, and re-rendering parts of the interface on the fly. Beyond the browser, JavaScript also runs on the server through the **Node.js** runtime, which is what allows a single language to span both ends of a web application and which underpins the build tooling of the frontend framework used in this project (Next.js, Section 1.2).

In the **DeepGuard** platform, JavaScript (in its typed superset **TypeScript**) is used to:

- Handle user interactions and form submissions on the analyst dashboard — for example uploading a face image in the integration *Playground* and triggering a detection request.
- Make asynchronous API calls to the FastAPI backend using the browser **Fetch API**, attaching the authorisation token (a JWT for dashboard users, an API key for external integrations) to every request.
- Dynamically update the user interface in response to the returned verdict — rendering the risk score, the Grad-CAM heat-map, and the 2D-DCT frequency spectrum without reloading the page.

JavaScript works hand in hand with HTML and CSS and, through React and Next.js, is the foundation on which the entire DeepGuard front end is built.

*Takeaway:* JavaScript is the behavioural layer of the web and the language in which DeepGuard's interactive, single-page dashboard is written.

## 1.2 Next.js

**Next.js** is a production-grade React framework for building user interfaces and single-page applications (SPAs). It is built on top of React and is designed to be *incrementally adoptable*: the developer writes ordinary React components, and the framework supplies the surrounding machinery — routing, rendering strategies, and build tooling — needed to ship a real application. DeepGuard uses **Next.js 16 with the App Router** together with **React 19** and TypeScript, served as a single-page dashboard on port 3000.

### 1.2.1 Key features

- **Component-based architecture.** The interface is assembled from small, isolated, reusable React components, each encapsulating its own markup, styling, and logic — for example a `DetectionCard`, a `RiskBadge`, or a `GradCamViewer`.
- **File-system routing (App Router).** Each route in the dashboard (login, dashboard, tenants, team, API keys, playground, audit) is expressed as a directory of components, so the URL structure mirrors the source structure and new screens are added by adding folders.
- **Server and client components.** The App Router lets parts of the UI render on the server for fast first paint while keeping interactive parts on the client, which gives a responsive experience without sacrificing load time.
- **Declarative rendering with a virtual DOM.** React's reactivity system efficiently re-renders only the parts of the page whose underlying data changed — so when a detection result arrives, only the result panel updates.
- **Integrated build tooling.** Next.js bundles, transpiles, and optimises the TypeScript/JSX source into static and dynamic assets ready for deployment behind the reverse proxy on AWS (Section 1.13).

### 1.2.2 Advantages

Next.js was chosen for DeepGuard because it offers a *gentle learning curve* on top of React while remaining capable of powering a non-trivial multi-role dashboard; it is *flexible and lightweight*, scaling from a single component to a full SPA; it delivers *high performance* through the virtual DOM and server rendering; and it is backed by a *large community and mature documentation*. In practice this means the front end stays maintainable as the platform grows from five role-specific dashboards to additional screens (liveness, monitoring) without re-architecting the routing or data layer. Server-state caching is handled by **TanStack Query** while a small amount of client-only state (authentication, navigation, appearance) is kept in **Zustand**, keeping the UI consistent with the strict one-directional request flow described in Section 1.4.

*Takeaway:* Next.js is the React framework that turns DeepGuard's components into a fast, routable, multi-role single-page dashboard.

## 1.3 FastAPI

**FastAPI** is a modern, high-performance web framework for building APIs in Python (3.7+), built on standard Python *type hints*. It is designed for fast, scalable web APIs with automatic interactive documentation, strong typing, and first-class asynchronous support, and is widely used for RESTful backends, microservices, and machine-learning serving. DeepGuard's application tier is a FastAPI service served by **Uvicorn**, exposing the platform's complete REST surface — endpoints grouped into authentication, users/tenants, API keys, detection, liveness, dashboard detections, webhooks, and analytics/audit.

FastAPI is the *only* component permitted to reach the database and the SFDCT model; it enforces the one-directional flow `router → service → repository (CRUD)` and never lets a route touch PostgreSQL directly. Concretely, FastAPI's role in DeepGuard is to authenticate and authorise every request, validate inputs and serialise outputs through **Pydantic v2** schemas (separate Create / Read / Update models), persist and query records via SQLAlchemy, and — for detection requests such as `POST /v1/detect/image` — orchestrate inference by forwarding the face-cropped payload over `httpx` to the SFDCT microservice and returning the structured verdict (`prob_fake`, label, Grad-CAM). The backend deliberately keeps heavy machine-learning dependencies out of its own runtime: the model lives behind the microservice boundary, so the API process only needs an HTTP client to obtain predictions. FastAPI also auto-generates interactive documentation (**Swagger UI** at `/docs`), which doubles as the integration reference for external eKYC clients.

*Takeaway:* FastAPI is DeepGuard's typed, asynchronous API gateway — the single guarded door between the browser, the database, and the model.

## 1.4 HTTP API

An **HTTP API** (HyperText Transfer Protocol Application Programming Interface) is a standardised interface that lets different software systems communicate over the web using the HTTP protocol. It is the most common mechanism in modern web development for connecting the client side (frontend) to the server side (backend), and — in DeepGuard's case — for letting an external bank back-end call the detection service machine-to-machine. All communication in DeepGuard travels over HTTP using a **REST** style with JSON payloads: the browser reaches the backend over HTTPS, the backend reaches the SFDCT microservice over HTTP via `httpx`, and external eKYC clients call the public detection API the same way.

### 1.4.1 Structure of an HTTP API

HTTP APIs are typically organised around RESTful principles (Representational State Transfer), where each *resource* (a user, a tenant, an API key, a detection result) is reachable through a specific URL (endpoint), and actions on those resources are performed with standard HTTP methods:

- **GET** — retrieve data from the server (e.g. `GET /v1/results/{request_id}`).
- **POST** — send new data to the server (e.g. `POST /v1/detect/image`).
- **PUT / PATCH** — update existing data (e.g. update a tenant's quota).
- **DELETE** — remove data (e.g. revoke an API key).

Endpoints are organised by resource and verb — for example `POST /v1/detect/image` and `POST /v1/detect/video` for forgery detection, `POST /v1/detect/liveness` and `GET /v1/liveness/challenge` for liveness, and `GET /v1/results/{request_id}` to retrieve a stored result.

### 1.4.2 API request

A request to the API has four parts:

- **URL** — identifies the resource.
- **Method** — specifies the operation (GET, POST, etc.).
- **Headers** — additional metadata, e.g. the authentication token (`Authorization: Bearer ...`) and the content type.
- **Body** — the data being sent to the server, usually as JSON or, for image upload, as `multipart/form-data`.

### 1.4.3 API response

A response likewise has a consistent shape:

- **Status code** — the result of the request (e.g. `200 OK`, `401` invalid key, `402` quota exhausted, `429` rate limit, `422` invalid payload).
- **Headers** — metadata about the response (e.g. a `Retry-After` header on a `429`).
- **Body** — the actual data, usually JSON. DeepGuard follows fixed conventions: a `{items, total, page, limit}` envelope for paginated lists and a `{"detail": "..."}` body for errors.

Table 1.1 illustrates this contract on the central detection endpoint.

*Table 1.1: REST contract for the primary detection endpoint.*

| Field | Value |
|---|---|
| Method | POST |
| Path | `/v1/detect/image` |
| Auth | API Key (`Authorization: Bearer sk-dg-...`) |
| Request | `multipart/form-data` image file (face-cropped via MTCNN [17] before inference) |
| Response (200) | `{ "request_id": "...", "verdict": "FAKE", "prob_fake": 0.93, "gradcam_b64": "..." }` |
| Errors | `401` invalid key · `402` quota exhausted · `429` rate limit · `422` invalid payload |

### 1.4.4 Benefits of using HTTP APIs

- **Platform independence** — any client (browser, mobile app, or another server) can talk to the API over HTTP.
- **Separation of concerns** — frontend and backend can be developed and deployed independently.
- **Scalability** — the API is easily extended as the platform grows.
- **Security** — it can be protected with authentication methods such as API keys, JWT, or OAuth; DeepGuard uses JWT for the dashboard and API keys for external integration.

*Takeaway:* the HTTP/REST API is the single JSON contract that ties DeepGuard's tiers together and exposes detection to external eKYC clients.

## 1.5 Domain Name System (DNS)

The **Domain Name System (DNS)** is a hierarchical, decentralised naming system that translates human-readable domain names (e.g. `deepguard.vn`) into the numerical IP addresses (e.g. `203.0.113.10`) that computers use to find each other on the Internet. DNS is a foundational component of the modern web: it lets users reach a service by name without remembering an address, and it is the mechanism that points a public domain at the cloud host on which DeepGuard runs.

DNS operates through several components:

- **Domain registrars** — entities through which a domain name is registered and managed (e.g. Namecheap, GoDaddy, or a Vietnamese `.vn` registrar).
- **DNS records** — configuration entries such as **A**, **CNAME**, **TXT**, and **MX** records that determine how traffic for a domain is routed; the **A record** maps a name to an IPv4 address.

### 1.5.1 DNS servers

- **Authoritative DNS servers** hold the actual records for a domain and answer queries about it definitively.
- **Recursive resolvers** query DNS records on behalf of clients, walking the hierarchy from the root down to the authoritative server and caching the result.

In DeepGuard, DNS is configured to map the public domain (and any subdomains, for example an `api.` host for the backend) to the **Elastic IP** of the AWS EC2 instance that hosts the containerised stack (Section 1.13). Proper DNS setup is essential for routing requests to the right host, for enabling HTTPS via certificate management (an ACM-issued certificate), and for keeping the public address stable across instance restarts.

*Takeaway:* DNS turns DeepGuard's domain name into the EC2 host's IP, and is the first link in the chain that delivers a request securely from the user's browser to the backend.

## 1.6 EfficientNet-B4

### 1.6.1 Why a strong spatial backbone is needed

Although the central scientific hypothesis of this thesis concerns the *frequency domain*, the detector still needs a strong spatial backbone as its "spine": many forgery traces — skin-texture inconsistency, eye/teeth-region errors, lighting mismatches — are inherently *spatial* phenomena. The frequency branch is designed to *complement* this spatial stream, not replace it. The question is therefore which backbone is both powerful and parameter-efficient. The thesis adopts **EfficientNet-B4** as the spatial branch, building on the EfficientNet family of convolutional networks.

### 1.6.2 Compound scaling — the core idea of EfficientNet

EfficientNet [1] stems from a simple observation: when increasing a CNN's capacity, there are three "knobs" to turn — **depth** (number of layers), **width** (number of channels), and **input resolution**. Prior designs typically turned only one knob (for example ResNet went deeper). EfficientNet showed that turning all three knobs *simultaneously and proportionally* according to a common ratio — **compound scaling** — yields a far better accuracy/FLOPs trade-off. Given a resource coefficient $\phi$, the three dimensions are scaled as

$$
\text{depth} = \alpha^{\phi}, \quad \text{width} = \beta^{\phi}, \quad \text{resolution} = \gamma^{\phi},
$$

subject to the constraint $\alpha \cdot \beta^{2} \cdot \gamma^{2} \approx 2$ (keeping the FLOPs increase approximately $2^{\phi}$-fold), where $\alpha, \beta, \gamma$ are found by a small grid search on the base network. Increasing $\phi$ produces the B0 → B7 family; **B4** is a well-balanced, mid-range point within it.

*Table 1.2: The three scaling dimensions of EfficientNet.*

| Scaling dimension | What is turned | Benefit | Risk if turned in isolation |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Number of layers | Captures more complex/abstract features | Harder to train (vanishing gradient) |
| Width ($\beta^\phi$) | Number of channels | Captures more fine-grained features | Saturation, poor parameter efficiency |
| Resolution ($\gamma^\phi$) | Input image size | Sees small details (subtle artifacts) | FLOPs grow rapidly |

### 1.6.3 The MBConv block — the building unit

The basic unit of EfficientNet is the **MBConv** (Mobile Inverted Bottleneck Convolution), inherited from MobileNetV2. Its intuition comprises three steps: (i) **expand** — a 1×1 convolution increases the number of channels (e.g. ×6) to create a wide representation space; (ii) **depthwise convolution** — a per-channel convolution (far cheaper than full convolution) to learn spatial patterns; (iii) **project** — a 1×1 convolution compresses the channels back to a small number (bottleneck). Each block also includes a **Squeeze-and-Excitation (SE)** module [24] — which learns a *per-channel importance* weight to amplify useful channels and suppress noisy ones — together with a **residual connection** when input and output dimensions match. This "expand-then-compress" (inverted bottleneck) structure enables learning rich representations while remaining parameter-efficient.

Worth noting for this thesis: the SE module is essentially a form of **channel attention** based on global statistics (global average pooling). This is the theoretical bridge to the **FcaNet-based lever (S4)** in Section 1.7.4 — which *generalises* SE by replacing average pooling with multiple DCT components, i.e. channel attention that is more *frequency-rich*.

![Figure 1.2 — MBConv block](figures/fig_1_2_mbconv.png)

*Figure 1.2: The MBConv block — expand 1×1 → depthwise convolution → Squeeze-and-Excitation → project 1×1, with a residual connection when dimensions match.*

### 1.6.4 Why B4 was chosen, and transfer learning from ImageNet

The choice of **B4** (rather than the smaller B0 or the larger B7) rests on three reasons:

1. **Leaderboard comparison.** EfficientNet-B4 is the backbone *commonly used* in DeepfakeBench baselines, so choosing B4 enables fair comparison and pipeline confirmation (the thesis B4 baseline reaches CDFv2 frame-AUC 0.7497, close to the DeepfakeBench-harmonized figure ≈ 0.7487, as discussed in Section 1.10.3).
2. **Resource balance.** B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU, allowing batch size 32 at 256×256 resolution.
3. **Suitable resolution.** B4 was originally designed for ~380 px input images; at 256×256 it still operates well and retains enough detail to capture small artifacts.

**Transfer learning.** The backbone is initialised with weights *pretrained on ImageNet* rather than trained from scratch. The reason: the low-level filters (edges, corners, textures) learned from millions of natural images are *generic* and immediately reusable; we need only fine-tune the higher layers for the forgery-detection task. This saves data, shortens convergence time, and usually improves generalisation. Input images are normalised with mean = std = 0.5 (mapping pixels to $[-1, 1]$), in line with the thesis pipeline configuration.

*Takeaway:* EfficientNet-B4 is the parameter-efficient, ImageNet-pretrained spatial backbone whose compound scaling and MBConv blocks give SFDCT a strong "spine" to which the frequency branch is attached.

## 1.7 The Discrete Cosine Transform (DCT) and Frequency-Domain Analysis

### 1.7.1 Why use DCT rather than Fourier

Section 1.9 will argue that forgery artifacts are clearly revealed in the frequency domain. Which *transform* should convert an image into that domain? The thesis chooses the **DCT (Discrete Cosine Transform)** [10] over the DFT/FFT for three reasons: (i) the DCT yields *real* coefficients (no complex imaginary part as in the Fourier transform), making it easy to feed into a neural network; (ii) the DCT has excellent **energy compaction** — it concentrates most of the signal's energy into a few low-frequency coefficients, making the high-frequency "residual" (where artifacts reside) stand out; (iii) the DCT is *exactly* the transform that the **JPEG** standard applies to each 8×8 block — so block-DCT is the most natural way to inspect traces related to compression and the block grid.

### 1.7.2 One-dimensional and two-dimensional DCT

**One-dimensional DCT (1D-DCT).** Given a discrete signal $x[n]$, $n = 0,\dots,N-1$, the DCT-II (the most common type) defines the $k$-th frequency coefficient

$$
X[k] = c(k)\sum_{n=0}^{N-1} x[n]\,\cos\!\left[\frac{\pi (2n+1)k}{2N}\right], \quad k = 0,\dots,N-1,
$$

with normalisation $c(0) = \sqrt{1/N}$ and $c(k) = \sqrt{2/N}$ for $k \ge 1$. Intuition: each $X[k]$ measures the *similarity* between the signal and a cosine of frequency $k$. The coefficient $X[0]$ (the **DC** term) is proportional to the signal's mean; large-$k$ coefficients (high-frequency **AC** terms) capture rapid variation — sharp edges, noise, and fine patterns.

**Two-dimensional DCT (2D-DCT).** For an image block $B(i,j)$ of size $M \times N$, the 2D-DCT is the 1D-DCT applied successively along rows then columns (separable):

$$
F(u,v) = c(u)\,c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1} B(i,j)\,\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right].
$$

The result $F(u,v)$ is a grid of coefficients: the top-left corner $(0,0)$ is the DC term ("coarse" content); moving towards the bottom-right gives increasingly high frequencies in both directions.

*Table 1.3: Meaning of coefficient position in a 2D-DCT block.*

| Coefficient position $(u,v)$ | Name | What it captures | Relation to forgery artifacts |
|---|---|---|---|
| $(0,0)$ | DC | Average brightness of the block | Carries content → prone to content leakage |
| Near top-left corner | Low frequency | Slow variation, coarse shape | Few artifacts |
| Mid region | Mid frequency | Texture, moderate patterns | Upsampling/blending artifacts clearly revealed |
| Bottom-right corner | High frequency | Sharp edges, noise, fine detail | Frequency inconsistency, compression traces |

### 1.7.3 Block-wise DCT 8×8, zigzag scan, 16 bands, log-magnitude, and YCbCr

**Block-wise DCT 8×8 and the JPEG connection.** Instead of applying the DCT to the whole image (global DCT, which mixes global content and makes local artifacts hard to isolate), the thesis uses **block-wise DCT 8×8**: the image is divided into a grid of non-overlapping 8×8 blocks, and the 2D-DCT is applied *independently* to each block — exactly JPEG's processing unit. The benefits are (i) localising artifacts to local regions (a blending boundary affects only a few blocks around the edge); (ii) matching the JPEG compression grid, making compression and forgery traces easy to detect together; (iii) low computational cost (fast 8×8 DCT algorithms). Each block yields 64 coefficients ordered DC → highest frequency.

**Zigzag scan and the 16 frequency bands.** The 64 coefficients are not used individually — too many dimensions, too much noise. They are grouped into **frequency bands** via the **zigzag scan**: a path that starts at the DC corner, traverses the anti-diagonals, and ends at the highest-frequency coefficient. Coefficients on the same anti-diagonal share the same total frequency level $(u+v)$, so the zigzag arranges the 64 coefficients into a sequence of *increasing frequency* (the same order JPEG uses for encoding). The thesis groups them into **16 frequency bands** from DC → high frequency, then computes per-band statistics (e.g. mean energy / log-magnitude) to form a compact, stable frequency feature. An important option is **drop low bands**: discarding the DC and the lowest bands, which mainly carry *content* — retaining them risks the model learning along image content (content leakage) rather than forgery traces. Removing them forces the frequency branch onto the mid–high bands, precisely where artifacts reside.

**Log-magnitude.** DCT coefficients span a huge dynamic range: the DC coefficient can be thousands of times larger than a high-frequency coefficient. Feeding raw amplitudes into a network would let the high-frequency coefficients (exactly where the artifacts are) be numerically swallowed. The **log-magnitude** transform fixes this:

$$
D(u,v) = \log\big(1 + |F(u,v)|\big).
$$

The $\log(1+\cdot)$ compresses the dynamic range, lifting small coefficients into numerically meaningful signals while avoiding $\log(0)$; high-frequency artifact peaks become observable and learnable.

**The YCbCr colour space.** The DCT is applied not to RGB but to **YCbCr** — the luminance channel **Y** and the two chrominance channels **Cb, Cr** — for two reasons: (i) YCbCr separates brightness from colour, mirroring the human visual system and the JPEG standard, and most frequency traces reside in Y; (ii) JPEG compresses Cb, Cr more heavily than Y (chroma subsampling), so their frequency statistics carry complementary compression/forgery information. Applying block-DCT independently on all three channels gives a more complete frequency picture than RGB or grayscale alone.

![Figure 1.3 — Zigzag scan and 16 frequency bands](figures/fig_1_3_zigzag.png)

*Figure 1.3: Zigzag scan over an 8×8 DCT block (left) and the grouping of the 64 coefficients into 16 frequency bands from DC to the highest frequency (right).*

**Summary of the chain.** Taken together, **YCbCr → block-DCT 8×8 → zigzag → 16 bands → log-magnitude (→ drop low bands)** turns a face image into a frequency representation that is *compact, locally localised, dynamic-range-normalised, and content-reduced*. In this representation the forgery traces of Section 1.9.4 — upsampling peaks, blending-boundary inconsistency, frequency-statistics mismatch — become clear patterns a lightweight branch can learn. This is the input to SFDCT's frequency branch.

### 1.7.4 Inherited frequency cues — the foundations of the five levers (S1–S5)

The block-DCT branch above is the *naive* SFDCT input. On top of it, the thesis studies five optional improvement "levers" $S1$–$S5$, each adapting the *original principle* of a prior work into the block-DCT domain. The system is **built on DeepfakeBench** and these levers **adapt the published ideas of SPSL, SRM, FcaNet, FreqDebias, and FDFL**. The goal here is only the theoretical basis — the original idea and the *direction of adaptation*; the implementation formulas are reserved for Chapter 2.

**S1 — SPSL → phase-analog sign (`dct_use_sign`).** SPSL (Spatial-Phase Shallow Learning) showed that the *phase spectrum*, not just the magnitude, carries important upsampling traces, and generalises well. The DCT yields *real* coefficients and so has no Fourier-style "phase"; however, the **sign** of a DCT coefficient is *analogous to phase* — it encodes the direction of the cosine component. The S1 lever therefore adds the *sign* of the DCT coefficients to the frequency feature (instead of using only log-magnitude, which discards it), providing a phase-analog signal without leaving the DCT domain.

**S2 — SRM → high-pass noise residual (`dct_srm_residual`).** SRM (Spatial Rich Model), from steganalysis, uses a bank of fixed **high-pass** filters to extract a **noise residual** — the signal that remains after removing low-frequency content — on which high-frequency forgery traces stand out far more because content has been suppressed. The S2 lever applies block-DCT *not on the raw image* but on an **SRM-style high-pass residual**, "cleaning out" the content so the subsequent block-DCT inspects only the noise containing the artifacts.

**S4 — FcaNet → multi-spectral channel attention (`dct_fca_attention`).** FcaNet generalises the Squeeze-and-Excitation module. SE compresses each feature map into *one* number via global average pooling — and average pooling is precisely the *DC component (frequency 0) of the DCT*. FcaNet argues that using only the DC discards information, and instead uses *multiple* DCT frequency components across channels, forming a more information-rich **multi-spectral channel attention**. The S4 lever brings FcaNet's multi-spectral attention layer into the architecture, so the network learns channel attention using the DCT components themselves — an elegant anchor in which both the backbone (via SE) and S4 are channel attention, but S4 is *frequency-rich*.

**S3 — FreqDebias → frequency mixup and consistency (`use_dct_fomixup`).** FreqDebias targets *frequency bias*: detectors tend to latch onto a specific tell-tale band of the training set, hurting generalisation. The remedy mixes frequency information across samples to break the rigid dependence, plus a **consistency** constraint forcing predictions to remain stable under those mixes. The S3 lever performs **DCTFoMixup** — mixing DCT bands across samples then an inverse-DCT back to the image (frequency-domain augmentation) — with a dual consistency loss (symmetric-KL on probabilities plus MSE on embeddings). S3 *adds no learnable parameters*, changing only data generation and the loss, and is therefore present in both Row1 and Row2.

**S5 — FDFL → single-center loss (`use_single_center_loss`).** FDFL (Frequency-aware Discriminative Feature Learning) improves the discriminativeness of the feature space via a **single-center loss**: rather than letting REAL and FAKE scatter arbitrarily, it compresses all REAL samples towards a single center in the embedding space while pushing FAKE away by a margin. Intuition: REAL is a *homogeneous* concept (natural statistics), whereas FAKE is diverse (many pipelines) — so compressing REAL tightly and treating "far from the cluster" as suspicious generalises well to unseen fakes. The S5 lever adds this loss, pushing FAKE away by a margin proportional to $\sqrt{D}$ (with $D$ the embedding dimension). It *adds parameters* (the center coordinates) and appears in Row2 together with S4.

*Table 1.4: The five levers S1–S5 — source paper, principle, and configuration in which each appears.*

| Lever | Flag name | Source paper | Core principle | Adds parameters? | Present in |
|---|---|---|---|---|---|
| S1 | `dct_use_sign` | SPSL [6] | Adds the DCT coefficient sign (phase-analog) | No | Row1 |
| S2 | `dct_srm_residual` | SRM [7] | Block-DCT on the high-pass residual | No | Row1 |
| S3 | `use_dct_fomixup` | FreqDebias [12] | Frequency mixup + dual consistency | No | Row1, Row2 |
| S4 | `dct_fca_attention` | FcaNet [5] | Multi-spectral channel attention (DCT) | Yes | Row2 |
| S5 | `use_single_center_loss` | FDFL [11] | Single-center loss (compress REAL to 1 center) | Yes | Row2 |

This organisation yields two configurations with a clear story: **Row1** = naive + S1+S2+S3 (no added learnable parameters; only changing the input feature and loss), and **Row2** = naive + S4+S5+S3 (with added learnable parameters: FcaNet + single-center loss). Splitting by "with/without added parameters" makes it possible to disentangle whether any AUC change comes from a *better feature* or from *more capacity*. The actual per-lever effect is an empirical question reported in Chapter 3 — and Row1's measured result is in fact a *negative* one (see Section 1.10 and Chapter 3). Within the thesis GPU budget, Row2 was not trained; instead, two single-axis variants (Fix1 = sign + drop-low-band, Fix2 = FcaNet-style attention) trained under the identical recipe provide a *partial* per-lever decomposition in Chapter 3, and the full one-lever-at-a-time table is left as future work.

*Takeaway:* the DCT chain (YCbCr → block-DCT → zigzag → 16 bands → log-magnitude) exposes forgery traces, and the five adapted levers (SPSL/SRM/FcaNet/FreqDebias/FDFL) are optional, honestly-scoped refinements of that frequency feature.

## 1.8 Attention Mechanisms and Feature Fusion

### 1.8.1 Why attention is needed to fuse the two branches

We now have two information streams: *spatial* features from EfficientNet-B4 and *frequency* features from the block-DCT branch. How should they be combined? The crudest approach — concatenation plus a fully-connected layer — has two drawbacks: (i) it mixes them *indiscriminately*, giving the model no way to decide *when* and *where* the frequency information is trustworthy; (ii) it *breaks* equivalence with the original backbone (no longer guaranteeing "no worse than B4"). The **attention** mechanism solves both, letting the spatial features *actively and selectively query* the frequency features.

### 1.8.2 Self-attention and cross-attention

**Self-attention** lets each position in a feature sequence "look at" every other position and aggregate information weighted by relevance, using three projection matrices — **Query** ($Q$), **Key** ($K$), **Value** ($V$). The scaled dot-product attention [30] is

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V,
$$

where $QK^\top$ measures query–key similarity (the *attention weights*), $\sqrt{d_k}$ is the scaling that prevents softmax saturation, and multiplication by $V$ returns a weighted combination of the values. Intuition: "for each question $Q$, take a weighted average of the values $V$, with high weight where $K$ matches $Q$."

**Cross-attention** is the variant in which $Q$ comes from *one source* while $K, V$ come from *another*. This is exactly what fusion needs: set $Q$ = spatial features and $K, V$ = frequency (DCT) features. Each spatial position then "asks" the frequency branch *"in this region, which frequency traces are relevant?"* and retrieves a **context vector** aggregated from the most relevant DCT features. This is the essence of the "gated cross-attention" that SFDCT uses to inject frequency information into the spatial stream.

*Table 1.5: Role of Q/K/V in SFDCT's cross-attention fusion.*

| Component | From branch | Role |
|---|---|---|
| Query $Q$ | Spatial (B4) | "Question": what frequency information does this region need? |
| Key $K$ | Frequency (block-DCT) | "Index": what each frequency feature describes |
| Value $V$ | Frequency (block-DCT) | "Content": the frequency information retrieved |
| Context | — | Weighted combination of $V$, injected back into the spatial stream |

### 1.8.3 Gated fusion and the meaning of the alpha gate

SFDCT does not inject the frequency context directly, but through a **gate** with a learnable coefficient $\alpha$:

$$
\text{feature}_{\text{fused}} = x + \alpha \cdot \text{context}(\text{DCT}),
$$

where $x$ is the spatial feature, $\text{context}(\text{DCT})$ is the cross-attention frequency context, and $\alpha$ is *learnable*. Intuition: $\alpha$ is a "volume knob" for the frequency branch. If the frequency information is *useful* during training, the gradient pushes $\alpha$ up (opening the gate); if it is noisy/useless, $\alpha$ is driven towards 0 (closing the gate). The learned $\alpha$ is therefore a *quantitative* indicator of how much the frequency branch contributes, which the thesis visualises (Figure 3.13, `gate_alpha.png`).

### 1.8.4 Zero-init: why it guarantees a floor ≥ backbone

This is a *pivotal* design choice from a risk standpoint. SFDCT initialises $\alpha = 0$ at the start of training (**zero-init**). Consequently, at initialisation,

$$
\text{feature}_{\text{fused}} = x + 0 \cdot \text{context}(\text{DCT}) = x,
$$

so the model is *exactly equal* to a pure EfficientNet-B4: the entire frequency branch does not perturb the pretrained spatial stream. Training then only *gradually opens* $\alpha$ if — and only if — the frequency information genuinely reduces the loss. This creates a **guaranteed floor**: in the worst case (a useless frequency branch), $\alpha$ stays near 0 and the model is *never worse* than B4. It is precisely this property that lets the thesis claim a "risk-safe" architecture — important in the eKYC context where reliability is paramount.

> **Note distinguishing SFDCT from SFCL-HCMF.** SFDCT's gate is initialised to **0** (a strict floor of the B4 backbone) and there is **no global-differential / SIDA branch** — SFDCT is purely EfficientNet-B4 (spatial) + an 8×8 block-DCT branch + zero-init gated cross-attention fusion. This differs from SFCL-HCMF, whose gate initialises at **0.5** (no such floor guarantee). The distinction matters whenever the two are contrasted in later chapters.

![Figure 1.4 — Zero-init gated cross-attention fusion](figures/fig_1_4_gate_fusion.png)

*Figure 1.4: Gated cross-attention fusion with the zero-initialised α gate — at initialisation the frequency branch is closed (α = 0) and the model is exactly the B4 backbone.*

*Takeaway:* gated cross-attention with a *zero-initialised* $\alpha$ lets the spatial stream selectively pull in frequency cues while guaranteeing the fused model is never worse than the B4 backbone.

## 1.9 Overview of Deepfake Technology

### 1.9.1 Why we must understand how deepfakes are generated

Before building a detector, we must understand how the *adversary* creates fake images, because every generation method leaves a "fingerprint" characteristic of its pipeline. If we understand the pixel transformations a generative algorithm performs, we know *where to look for the traces* — and, crucially, in *which representation domain* (spatial or frequency) those traces are most visible. This is the cornerstone of the thesis: the argument that certain traces are almost invisible in the spatial domain yet "loud" in the mid/high DCT bands.

### 1.9.2 Three families of face-forgery techniques

The term "deepfake" covers many techniques, reducible to three dominant architectural families:

**(a) Autoencoder face-swap.** The classic architecture behind tools like FaceSwap/DeepFaceLab: two autoencoders that *share an encoder* but have separate decoders for identities A and B. The encoder learns an identity-invariant latent (pose, expression, lighting). At inference, face A is encoded then decoded by B's decoder, giving face B with A's pose/expression. The final step always **blends** the generated face back into the original frame — and that blending step creates the **blending boundary**.

**(b) GAN (Generative Adversarial Network)** [23]**.** A *generator* learns to turn noise/input images into fakes, competing against a *discriminator* that learns to tell real from fake; they train adversarially until the fakes fool the discriminator. GANs power many high-quality face synthesisers (e.g. StyleGAN). The key point for this thesis: the generator builds a high-resolution image from a low-resolution tensor through **upsampling** layers (transposed convolution or interpolation + convolution), leaving **upsampling artifacts** — periodic patterns that show up as abnormal spectral peaks.

**(c) Diffusion model.** The newest family synthesises images by learning to reverse a gradual noising process: starting from Gaussian noise, a denoising network iterates to reconstruct an image. Diffusion is very high quality but still leaves frequency statistics that differ from natural photographs. In scope here, diffusion is noted as a trend the detector should eventually generalise to (future work), while the main training data (FF++) belongs to the first two families.

![Figure 1.5 — Three face-generation pipelines](figures/fig_1_5_pipelines.png)

*Figure 1.5: The three face-generation families (autoencoder face-swap, GAN, diffusion); all converge on a final upsampling/blending step that leaves frequency-domain artifacts.*

### 1.9.3 Four forgery families in FaceForensics++

The standard FaceForensics++ (FF++) dataset [2] aggregates four forgery methods spanning two manipulation types — *identity swap* and *expression reenactment*:

*Table 1.6: The four forgery families in FF++ — mechanism and characteristic trace.*

| Method | Manipulation type | Core mechanism | Characteristic trace |
|---|---|---|---|
| **Deepfakes** | Identity swap | Autoencoder swaps identity then blends into the frame | Blending boundary, texture inconsistency between face region and background |
| **Face2Face** | Expression reenactment | 3D-model-based expression reenactment, re-rendering the mouth/face region | Rendering errors, boundary noise around the reenacted region |
| **FaceSwap** | Identity swap | Graphics-based face swap, matching 3D landmarks then blending | Rigid geometric seams, lighting inconsistency |
| **NeuralTextures** | Expression reenactment | Learned neural textures + differentiable rendering (neural rendering) | Subtle artifacts around the mouth, hard to see in the spatial domain |

These four span both *deep-learning-based* manipulations (Deepfakes, NeuralTextures) and *traditional graphics-based* ones (Face2Face, FaceSwap), forcing the detector to learn *common* traces rather than memorising a single artifact type.

### 1.9.4 Forgery traces: weak in the spatial domain, clear in the frequency domain

This is the *central thesis* of the work, so its intuition deserves explicit statement. The three most common trace types are:

1. **Blending boundary.** When the generated face is blended in, two regions with different statistics (sharpness, sensor-noise level, colour balance) are forced to meet. In the pixel domain, smoothing (feathering, Poisson blending) renders the boundary almost invisible. But this smoothing alters the *local frequency structure*: it abnormally suppresses high-frequency energy around the boundary.

2. **Upsampling artifact.** The upsampling layers of a GAN/decoder produce periodic grid-like patterns. The eye barely perceives them, but in the DCT/Fourier spectrum they appear as *energy peaks* localised in the mid/high bands.

3. **Frequency inconsistency.** A real camera's processing chain (demosaicing, JPEG) produces a natural, *consistent* frequency signature across the image. Fakes composited from multiple sources or passed through a generative network violate this consistency, leaving phase/amplitude mismatches across bands.

**Why this matters for the design.** A spatial CNN learns filters over the pixel grid; it *can* indirectly capture some frequency artifacts, but inefficiently, because these traces are tiny and "submerged" in image content. By contrast, *actively* projecting the image into the frequency domain (via block-DCT) "pulls out" the artifacts into discrete coefficients easily separated from content. This is exactly the motivation for adding a **frequency branch** parallel to the spatial backbone — the direct rationale for SFDCT's two-branch architecture.

A real measured example of this contrast — a real/fake pair whose difference is near-invisible in the pixel domain yet clearly separated in the log-magnitude DCT spectrum — is shown with the thesis's own data in **Figure 3.2** and the per-band energy comparison in **Figure 3.11** (Chapter 3).

*Takeaway:* deepfakes are made by autoencoder swap, GANs, and diffusion, all of which leave traces that are weak in pixels but loud in the mid/high DCT bands — the empirical basis for SFDCT's frequency branch.

## 1.10 The Deepfake Detection Problem and the Generalisation Challenge

### 1.10.1 Definition of the binary classification problem

At its most basic, deepfake detection is a frame-level **binary classification** problem: given a face image $x$, the model $f_\theta$ outputs

$$
\hat{y} = f_\theta(x) \in [0, 1],
$$

the probability that the image is **FAKE**; the ground-truth label is $y \in \{0, 1\}$ with $0 = $ REAL, $1 = $ FAKE. Training uses binary cross-entropy:

$$
\mathcal{L}_{\text{BCE}} = -\big[\, y \log \hat{y} + (1 - y)\log(1 - \hat{y}) \,\big].
$$

Because the problem is frame-level, a video is scored by aggregating per-frame probabilities (e.g. averaging), but the *headline metric* of this thesis is **frame-level AUC** — a direct measure of real–fake separability at the image level.

**Why AUC rather than accuracy?** Accuracy depends on a fixed threshold and is highly sensitive to class imbalance — and deepfake sets are typically skewed. **AUC (Area Under the ROC Curve)** [21] measures the probability that the model ranks a random FAKE above a random REAL, *independently of any threshold*, which is why it is the de-facto standard in deepfake benchmarks.

*Table 1.7: Mapping of the problem symbols.*

| Symbol | Role | Meaning |
|---|---|---|
| $x$ | Input | 256×256 face-crop image |
| $f_\theta$ | Model | Detector with parameters $\theta$ |
| $\hat{y}$ | Output | Probability of being FAKE, $\in [0,1]$ |
| $y$ | Label | 0 = REAL, 1 = FAKE |
| AUC | Metric | Real–fake separability, threshold-independent |

### 1.10.2 The paradox: high in-dataset, dropping cross-dataset

A modern model trained and tested *on the same dataset* (in-dataset) usually attains a very high AUC — not uncommonly above 0.99 on FF++. But tested on a *different* dataset (cross-dataset), e.g. Celeb-DF-v2, the AUC typically drops sharply to around 0.6–0.75. This is the **generalisation paradox** and the central challenge of this thesis.

**Why does it drop?** The model learns to *mistakenly* rely on *method-specific artifacts* of one pipeline rather than on *common* traces shared by all forgery types. A model may inadvertently learn that "Deepfakes-FF++ images exhibit an upsampling grid at frequency $k$"; that pattern vanishes on Celeb-DF (a different pipeline), and the model loses its bearings — a form of *overfitting to the training set's artifacts*.

**Design implication.** To generalise, we must steer the model towards *pipeline-invariant* traces. This is why the thesis prioritises the *frequency domain*: shared physical principles (every generator must upsample; every blend breaks frequency consistency) produce more universal traces than any specific spatial texture. It is also why the evaluation protocol *deliberately* trains and tests on different datasets (FF++ → CDFv2) — to measure exactly the thing we care about: generalisation.

### 1.10.3 Robustness to compression, standard datasets, and the DeepfakeBench protocol

**Robustness to compression.** In the real eKYC setting, uploaded images/videos are almost always **compressed** (JPEG for images, H.264 for video). Compression both *erases* part of the high-frequency energy where many artifacts live, and introduces **block artifacts** (JPEG's 8×8 grid) that can be confused with forgery traces. FF++ is therefore used at the **c23** level (moderate compression, H.264 CRF 23) — realistic, neither too ideal (raw) nor too heavy (c40). Training on c23 accustoms the model to a degradation level close to operating conditions; a useful eKYC detector must be robust to compression, an implicit criterion in the frequency branch (which prioritises bands that remain stable under compression).

**FaceForensics++ (c23) — training set.** FF++ is the foundational face-forgery dataset: **1000 real videos** (from YouTube) and four corresponding fake sets (Deepfakes, Face2Face, FaceSwap, NeuralTextures). Each level is released as raw, **c23** (light–moderate, H.264 CRF 23), and c40 (heavy). The thesis uses **c23** to balance realism with retaining enough frequency traces to learn.

**Celeb-DF-v2 — cross-dataset test set.** CDFv2 [3] is a *high-quality* deepfake dataset, harder than FF++: **590 real videos** of celebrities and **5639 deepfake videos** refined to remove the coarse artifacts (colour flicker, visible boundaries) of older sets. Because it uses a synthesis pipeline *entirely different* from FF++, it is an ideal generalisation test. **CDFv2 is used only for TESTING and never for training** — a mandatory condition of fair cross-dataset evaluation.

**The DeepfakeBench evaluation protocol.** The system is **built on DeepfakeBench** [4], a framework that standardises training and evaluation to remove inconsistencies (in pre-processing, splitting, metric computation) that make cross-paper numbers hard to compare. The thesis protocol follows it:

- **Train** on FF++ (c23).
- **Cross-dataset test** on Celeb-DF-v2.
- **Headline metric**: frame-level AUC on CDFv2.
- **Standard hyperparameters**: batch size 32, frame_num 32, Adam optimizer [25], learning rate 2e-4, 256×256 input.

Adhering to DeepfakeBench enables direct leaderboard comparison: the thesis EfficientNet-B4 baseline attains a CDFv2 frame-AUC of **0.7497**, close to the harmonized leaderboard figure (≈ 0.7487) — *confirming the pipeline is built correctly* before any improvement is attempted. The naive SFDCT reaches **0.7572** (Δ **+0.0075** over B4, *within noise* — this thesis makes **no SOTA claim**; SPSL at 0.7650 still beats it), and the Row1 lever variant in fact measures **0.7333** (Δ **−0.0164**, *below* the baseline — an honest negative result discussed in Chapter 3). Row2 was not trained within the thesis GPU budget and is left as future work; the strongest measured member of the family is the **block-DCT-HFF** architectural variant (R3, Section 2.3.6), which reaches **0.7695** — still below SPSL, and with a paired bootstrap confidence interval that contains zero (Chapter 3).

*Table 1.8: Summary statistics of the two datasets.*

| Property | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Role | Train | Test (cross-dataset) |
| Real videos | 1000 | 590 |
| Fake videos | 4000 (4 methods × 1000) | 5639 |
| Number of fake methods | 4 | 1 (unified pipeline) |
| Compression level used | c23 (H.264 CRF 23) | MPEG-4/H.264 (CDFv2 release) |
| Number of extracted frames | ≈ 159,626 | 16,420 (test set: 5,620 real + 10,800 fake) |
| Frames per video | 32 (frame_num) | 32 (frame_num) |

*Takeaway:* deepfake detection is frame-level binary classification measured by AUC, and the hard part is the in-dataset→cross-dataset collapse — which is exactly why the thesis trains on FF++ (c23) and tests on CDFv2 under the DeepfakeBench protocol, where its B4 baseline (0.7497) and naive SFDCT (0.7572) sit honestly behind SOTA.

## 1.11 The eKYC Application Context and Legal Requirements

### 1.11.1 What eKYC is and its anti-deepfake role

**eKYC (electronic Know Your Customer)** is the process of identifying customers *electronically*: instead of visiting a counter, users photograph their documents and faces with a phone to open an account or transact. Its core step is **face matching** between the selfie and the document photo, together with an **anti-spoofing** step. This is exactly where deepfakes become a direct threat: a fraudster can use deepfake images/videos of a victim's face to bypass verification, open accounts illegitimately, or hijack accounts. A deepfake detector that *generalises well to unseen pipelines* is therefore an essential defence layer for eKYC — the applied motivation of the entire thesis.

### 1.11.2 Circular 17/2024/TT-NHNN and the FPR ≤ 5% operating point (our convention)

In Vietnam, **Circular 17/2024/TT-NHNN** [14] regulates the opening and use of payment accounts and **mandates biometric authentication** for certain banking transactions. It must be stated precisely: **Circular 17 imposes a QUALITATIVE requirement — mandatory biometric matching — but does NOT specify a concrete quantitative threshold (no FPR/FAR figure is mandated).** To *operationalise* this qualitative requirement into something measurable, *this thesis* adopts the operating point **FPR ≤ 5%** following the **ISO/IEC 30107-3 convention** [13] (BPCER at APCER = 5%). In our context, FPR is the proportion of *real* images misclassified as *fake*; the constraint **FPR ≤ 5%** means the system must not reject more than 5% of legitimate users. In short, **we adopt FPR ≤ 5% per ISO/IEC 30107-3 to satisfy TT17's qualitative biometric-verification requirement** — the 5% figure is *our* choice under an international standard, *not* a figure mandated by TT17.

**Technical implication: threshold calibration.** AUC measures separability *independently of any threshold*, but *deploying* forces a concrete decision threshold $\tau$. To satisfy FPR ≤ 5% we **calibrate** $\tau$ on a validation set: find the threshold at which the real-flagged-as-fake rate does not exceed 5%, then report the TPR (fakes caught) at that threshold. This separates *model capability* (AUC) from the *operating point* and is mandatory for any serious eKYC deployment. For the naive SFDCT, this calibration yields $\tau =$ **0.9514** at FPR = **0.0500**, giving TPR = **0.2298**, accuracy **0.476**, and F1 **0.366** (confusion at $\tau$: TN **5339**, FP **281**, FN **8318**, TP **2482**). The blunt reading is honest: at a strict 5% false-reject budget on a cross-dataset model of AUC ≈ 0.75, the true-positive rate collapses to about 23% — the model is a useful *risk signal*, not an automatic gatekeeper.

### 1.11.3 The need for XAI (explainability)

In a tightly regulated financial setting, a "REAL/FAKE" decision *cannot* be a black box. When the system rejects a transaction, *explainable* evidence is needed for auditing and appeals. The thesis meets this with **Grad-CAM** [9] — a technique that highlights, as a heat-map, the image regions the model *relies on*. The eKYC demo outputs `prob_fake` together with a Grad-CAM overlay, letting an operator see *where the model is looking* (e.g. the blending-boundary region around the chin) — turning an abstract score into an intuitive explanation consistent with banking transparency requirements.

*Takeaway:* eKYC needs deepfake defence that generalises; TT17 demands biometric verification only *qualitatively*, so we adopt FPR ≤ 5% per ISO/IEC 30107-3 as our own operating point — and at that strict budget the cross-dataset model is a transparent risk signal (Grad-CAM-explained), not an unappealable verdict.

## 1.12 Liveness Detection (Face Anti-Spoofing) Theory

> **Scope note.** Liveness detection (Face Anti-Spoofing, FAS) is a **secondary, measured module** of this thesis. It reuses the SFDCT backbone — comparing **B4 (spatial-only)** against **B4 + block-DCT** on the **LCC-FASD** dataset [28] (with **NUAA** [26] as a sanity reference), and is designed as a **cascade pre-filter** (liveness → deepfake) in the eKYC pipeline. The pre-registered targets (ACER ≈ 16%, AUC ≈ 0.92) were both cleared by the measured results — **B4: ACER 6.85% / AUC 0.9829** on the official evaluation split (§3.1.8). This section presents the theory; the method and measured results are in Chapters 2 and 3.

### 1.12.1 What liveness detection is, and where it sits in eKYC

Where deepfake detection asks *"was this face digitally synthesised?"*, **liveness detection / Presentation Attack Detection (PAD)** asks a complementary question: *"is a live person physically present in front of the camera, or is the camera being shown an artefact?"* In an eKYC pipeline the two are layered: a **liveness pre-filter** first rejects obvious presentation attacks (a photo, a phone screen, a printed mask), and only genuinely live captures proceed to deepfake and document checks. This cascade ordering is efficient — the cheap liveness check screens out the easiest attacks before the heavier deepfake model runs.

### 1.12.2 Taxonomy of presentation attacks (PAI)

A **Presentation Attack Instrument (PAI)** is the physical artefact used to spoof the system. The common categories are:

- **Print attack** — a printed photograph (paper, poster, A4) of the target's face is held up to the camera. Its characteristic traces are halftone/printing noise and the loss of fine 3D facial detail.
- **Replay attack** — a video or photo of the target is *replayed* on a screen (phone, tablet, monitor). Its hallmark trace is the **moiré pattern**: the screen's pixel grid superimposed on the camera's sensor grid produces interference fringes that appear as *spurs/peaks in the frequency spectrum* — largely absent in a live capture.
- **3D mask attack** — a wearable mask (paper, silicone, resin) reproduces facial geometry. These are rarer and harder, often requiring depth/IR or pulse cues to defeat; they are noted here for completeness but are outside the cheap, RGB-only scope of this module.

This taxonomy matters for the frequency hypothesis: **replay artifacts (moiré) are especially loud in the DCT/Fourier domain**, which is the *physical analog* of the deepfake hypothesis (GAN/upsampling artifacts in mid/high bands). This is precisely why the SFDCT block-DCT branch has a principled reason to help liveness too. Honestly, the effect is *attack-dependent*: moiré is strong for *replay* and weak for *print* (print leaves halftone noise instead), so the frequency branch is expected to help replay more than print; a per-attack APCER/BPCER decomposition is left as future work.

### 1.12.3 Passive vs. active liveness

- **Passive liveness** analyses a single captured frame (or short clip) for spoof cues — texture, frequency artifacts, micro-detail — without asking the user to do anything. It is frictionless and is the approach this thesis adopts (it reuses the single-frame SFDCT pipeline directly).
- **Active (challenge-response) liveness** asks the user to perform an action — blink, turn the head, follow a moving dot, read a number — and verifies the response. It is more robust to replay/print but adds friction and requires temporal/video processing, so it is out of scope for the cheap reuse-SFDCT plan.

### 1.12.4 Metrics: APCER, BPCER, ACER

Liveness performance is reported with the **ISO/IEC 30107-3** metrics, treating *spoof/attack as the positive class*:

- **APCER (Attack Presentation Classification Error Rate)** — the fraction of *attacks* misclassified as *bona fide* (a spoof getting through, the dangerous error). Reported as the **worst case (max) over PAI types**.
- **BPCER (Bona-fide Presentation Classification Error Rate)** — the fraction of *genuine* presentations misclassified as *attacks* (a real user wrongly rejected).
- **ACER (Average Classification Error Rate)** — the mean of the two, $\text{ACER} = \tfrac{1}{2}(\text{APCER} + \text{BPCER})$, an overall intra-dataset score at one threshold.

For cross-dataset evaluation the equivalent quantity is **HTER** $= \tfrac{1}{2}(\text{FAR}+\text{FRR})$ (equal to ACER when positive = spoof), and **AUC**/**EER** are reported threshold-independently as for deepfake. Following honest reporting discipline, the operating threshold is chosen at **EER on a dev/validation set** and then *fixed* to compute HTER/ACER on the test set. For the eKYC tie-in, the module will also report **BPCER @ APCER ≤ 5%**, mirroring the FPR ≤ 5% convention of Section 1.11.2.

*Table 1.9: Liveness (PAD) metrics and when each is used.*

| Metric | Formula (positive = spoof) | Used for |
|---|---|---|
| APCER | FP / (TN+FP), worst-case max over PAI | spoof wrongly accepted (dangerous) |
| BPCER | FN / (TP+FN) | genuine user wrongly rejected |
| ACER | ½(APCER + BPCER) | overall intra-dataset @ one threshold |
| HTER | ½(FAR + FRR) | cross-dataset generalisation |
| EER | error where FAR = FRR | balanced operating point |
| AUC | area under ROC, threshold-independent | direct B4 vs. B4+DCT comparison |

The pre-registered targets for the liveness module were **ACER ≈ 16%** and **AUC ≈ 0.92**; the measured results on the official LCC-FASD evaluation split (Section 3.1.8) clear both with margin — **ACER 6.85% / AUC 0.9829** for the B4 head, and **7.54% / 0.9776** for B4+DCT.

*Takeaway:* liveness detection (PAD) is the complementary "is a live person present?" check that pre-filters eKYC; it classifies print/replay/mask attacks (passively) and is scored with APCER/BPCER/ACER — and the measured result (§3.1.8) shows the spatial B4 head already solves LCC-FASD well, with the frequency branch adding nothing on this dataset.

## 1.13 Amazon Web Services (AWS)

Amazon Web Services (AWS) is the most comprehensive and widely adopted cloud platform in the world, offering hundreds of fully featured services from global data centres. AWS lets individuals and organisations build infrastructure, store and process data, distribute content, and manage applications without owning physical hardware. DeepGuard is deployed onto AWS so that the same containerised stack validated locally under Docker Compose runs unchanged in the cloud. The relevant services are described below.

- **EC2 (Elastic Compute Cloud).** EC2 provides scalable virtual servers (*instances*) in the cloud, configurable with a chosen OS, CPU, RAM, and storage to deploy web applications and backend services. In DeepGuard, a single EC2 instance is the production host on which Docker Compose runs the frontend, backend, SFDCT microservice, and PostgreSQL containers as one unit. Because serving runs on CPU, the instance is sized for RAM rather than raw compute (a `t3.large`-class instance, 2 vCPU / 8 GB RAM, so that PyTorch + MTCNN, the API, the database, and the frontend all reside without swapping).

- **Lambda (Serverless Computing).** AWS Lambda runs code without provisioning or managing servers: the developer uploads code and defines an event trigger (e.g. a file uploaded to S3, or an HTTP request), and Lambda executes in response. It is described here as a complementary serverless option in the AWS toolkit for event-driven tasks around the platform.

- **S3 (Simple Storage Service).** Amazon S3 is an object-storage service for storing and retrieving data — images, videos, documents, backups — as "objects" inside "buckets", managed via the Console, APIs, or SDKs. It is the natural place to hold uploaded eKYC media, model checkpoints, and exported audit artefacts.

- **CloudFront.** Amazon CloudFront is a Content Delivery Network (CDN) that speeds up delivery of static and dynamic content through a global network of edge locations, commonly used to serve images, video, and web assets (for example the Next.js frontend's static bundle).

- **ACM (AWS Certificate Manager).** ACM provides free SSL/TLS certificates for securing HTTPS traffic. In DeepGuard, ACM (or an equivalent ACME flow) supplies the certificate for the public domain, so all browser traffic and all external eKYC integrations travel over HTTPS to the reverse proxy.

- **CloudWatch Logs (Monitoring and Logging).** Amazon CloudWatch Logs collects and stores logs from EC2, Lambda, and other resources. In DeepGuard it is used to monitor backend inference activity, track error rates and performance bottlenecks, and trigger alerts (for example a notification to Google Chat) when an anomaly occurs — the monitoring-and-alerting tier of the architecture.

- **Elastic IP.** An Elastic IP is a static, public IPv4 address assigned to an EC2 instance, keeping the backend reachable at a fixed address even after instance restarts. This stable address is what the DNS A-record (Section 1.5) points to, binding the public domain to the host.

*Takeaway:* AWS supplies the cloud primitives — EC2 to host the containers, S3 for media/checkpoints, CloudFront for delivery, ACM for TLS, CloudWatch for monitoring/alerting, and an Elastic IP for a stable DNS target — that turn the local DeepGuard stack into a reachable, secured cloud deployment.

## 1.14 Conclusion

This chapter has established both the engineering and the scientific foundations of the DeepGuard platform and its SFDCT detector. On the engineering side, we covered the web stack that makes the system usable — **JavaScript** as the browser's behavioural layer, **Next.js/React** for the single-page dashboard, **FastAPI** as the guarded API gateway, the **HTTP/REST API** contract that ties the tiers and external eKYC clients together, and **DNS** mapping the public domain to the host. On the scientific side, we built up the detector from its parts: the **EfficientNet-B4** spatial backbone (compound scaling, MBConv, ImageNet transfer learning); the **block-wise 8×8 DCT** frequency representation (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) together with the foundations of the five inherited levers **S1–S5** (adapted from SPSL, SRM, FcaNet, FreqDebias, FDFL, all built on **DeepfakeBench**); and the **gated cross-attention** fusion with its *zero-init* $\alpha$ gate that guarantees a floor no worse than B4 — distinct from SFCL-HCMF's 0.5-initialised gate, and with no SIDA branch.

We then grounded these tools in their domain: the *technical nature* of deepfake generation (autoencoder swap, GAN, diffusion; the four FF++ families) and the **central hypothesis** that forgery traces are weak in pixels but loud in mid/high frequency bands; the **generalisation paradox** (high in-dataset, dropping cross-dataset) that motivates the FF++ → CDFv2 protocol, with the honest standings of the B4 baseline (**0.7497**) and naive SFDCT (**0.7572**, within noise, still behind SPSL's 0.7650); the **eKYC context** with TT17's *qualitative* biometric mandate operationalised by *our* FPR ≤ 5% choice per ISO/IEC 30107-3, the resulting strict operating point ($\tau = 0.9514$, TPR collapsing to 0.2298), and the need for **XAI** via Grad-CAM; and the *secondary, measured* **liveness** module (PAD taxonomy of print/replay/mask, passive vs. active, APCER/BPCER/ACER), whose pre-registered targets were cleared by the measured results (§3.1.8). Finally we surveyed the **AWS** services that carry the platform into the cloud.

On this foundation, **Chapter 2** presents the system analysis and design in detail — the requirements, the use-cases and architecture, the deepfake-detection method (data pipeline, SFDCT architecture, the five-lever/four-ablation design space, loss, and the risk-score decision inference), and the secondary liveness-detection method (measured in §3.1.8).
