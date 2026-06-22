# CHAPTER 1: THEORIES AND TECHNOLOGIES

This chapter presents the theory and the technologies behind the **DeepGuard** platform and its core detector, **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT). The chapter moves from the outside of the system to the inside. It starts with the web stack that the user touches directly: JavaScript, Next.js, FastAPI, the HTTP API contract, and DNS. It then explains the AI building blocks of the detector, namely EfficientNet-B4, the Discrete Cosine Transform, and attention-based fusion. After that, it turns to the domain itself. We look at how deepfakes are made, why detecting them across datasets is hard, what the eKYC context demands, and how a secondary liveness module fits in. The chapter closes with the cloud-deployment technologies (AWS) and a summary. Throughout, each idea is presented with the formula first and the intuition after, and is anchored to a figure or a table where possible.

## 1.1 JavaScript

JavaScript is a high-level, dynamically typed programming language and the standard language of the web browser. HTML describes the structure of a page and CSS describes its appearance; JavaScript supplies its behaviour. It runs inside every modern browser and lets a page react to the user. Typical examples are responding to clicks, validating a form before it is sent, fetching data without a full page reload, and re-rendering parts of the interface on the fly. JavaScript also runs on the server through the **Node.js** runtime. As a result, one language can cover both ends of a web application, and the same runtime powers the build tooling of the frontend framework used in this project (Next.js, Section 1.2).

In the DeepGuard platform, JavaScript (in its typed superset **TypeScript**) is used to:

- Handle user interactions and form submissions on the analyst dashboard, for example uploading a face image in the integration Playground and triggering a detection request.
- Make asynchronous API calls to the FastAPI backend using the browser Fetch API. Every request carries an authorisation token: a JWT for dashboard users, or an API key for external integrations.
- Update the user interface when the verdict returns, rendering the risk score, the Grad-CAM heat-map, and the 2D-DCT frequency spectrum without reloading the page.

JavaScript works hand in hand with HTML and CSS and, through React and Next.js, it is the language in which the entire DeepGuard front end is written.

## 1.2 Next.js

**Next.js** is a production-grade React framework for building user interfaces and single-page applications (SPAs). It sits on top of React and is designed to be adopted step by step. The developer writes ordinary React components, and the framework supplies the surrounding machinery needed to ship a real application: routing, rendering strategies, and build tooling. DeepGuard uses Next.js 16 with the App Router, together with React 19 and TypeScript, served as a single-page dashboard on port 3000.

### 1.2.1 Key features

- **Component-based architecture.** The interface is assembled from small, isolated, reusable React components. Each component holds its own markup, styling, and logic, for example a `DetectionCard`, a `RiskBadge`, or a `GradCamViewer`.
- **File-system routing (App Router).** Each route in the dashboard (login, dashboard, tenants, team, API keys, playground, audit) is expressed as a directory of components. The URL structure therefore mirrors the source structure, and a new screen is added by adding a folder.
- **Server and client components.** The App Router lets parts of the UI render on the server for a fast first paint, while the interactive parts stay on the client. This gives a responsive experience without sacrificing load time.
- **Declarative rendering with a virtual DOM.** React re-renders only the parts of the page whose underlying data changed. When a detection result arrives, only the result panel updates.
- **Integrated build tooling.** Next.js bundles, transpiles, and optimises the TypeScript/JSX source into static and dynamic assets, ready for deployment behind the reverse proxy on AWS (Section 1.13).

### 1.2.2 Advantages

Next.js was chosen for DeepGuard for practical reasons. It has a gentle learning curve on top of React, yet it can power a non-trivial multi-role dashboard. It is flexible and lightweight, and it scales from a single component to a full SPA. It performs well thanks to the virtual DOM and server rendering, and it is backed by a large community and mature documentation. In practice, this means the front end stays maintainable as the platform grows from five role-specific dashboards to additional screens (liveness, monitoring) without re-architecting the routing or the data layer.

Server-state caching is handled by TanStack Query, while a small amount of client-only state (authentication, navigation, appearance) is kept in Zustand. This keeps the UI consistent with the strict one-directional request flow described in Section 1.4.

## 1.3 FastAPI

**FastAPI** is a modern, high-performance web framework for building APIs in Python (3.7+), built on standard Python type hints. It is designed for fast, scalable web APIs with automatic interactive documentation, strong typing, and first-class asynchronous support. It is widely used for RESTful backends, microservices, and machine-learning serving. DeepGuard's application tier is a FastAPI service run by Uvicorn. It exposes the platform's complete REST surface, with endpoints grouped into authentication, users/tenants, API keys, detection, liveness, dashboard detections, webhooks, and analytics/audit.

FastAPI is the only component allowed to reach the database and the SFDCT model. It enforces the one-directional flow `router → service → repository (CRUD)` and never lets a route touch PostgreSQL directly. In concrete terms, FastAPI authenticates and authorises every request, validates inputs and serialises outputs through **Pydantic v2** schemas (separate Create / Read / Update models), and persists and queries records via SQLAlchemy. For detection requests such as `POST /v1/detect/image`, it forwards the face-cropped payload over `httpx` to the SFDCT microservice and returns the structured verdict (`prob_fake`, label, Grad-CAM). The backend deliberately keeps heavy machine-learning dependencies out of its own runtime: the model lives behind the microservice boundary, so the API process only needs an HTTP client to obtain predictions. FastAPI also auto-generates interactive documentation (Swagger UI at `/docs`), which doubles as the integration reference for external eKYC clients. In this design, FastAPI acts as the single guarded door between the browser, the database, and the model.

## 1.4 HTTP API

An **HTTP API** (HyperText Transfer Protocol Application Programming Interface) is a standardised interface that lets different software systems communicate over the web using the HTTP protocol. It is the most common way in modern web development to connect the client side (frontend) to the server side (backend). In DeepGuard it is also how an external bank back-end calls the detection service machine-to-machine. All communication in DeepGuard travels over HTTP in a REST style with JSON payloads. The browser reaches the backend over HTTPS, the backend reaches the SFDCT microservice over HTTP via `httpx`, and external eKYC clients call the public detection API in the same way.

### 1.4.1 Structure of an HTTP API

HTTP APIs are usually organised around RESTful principles (Representational State Transfer). Each resource (a user, a tenant, an API key, a detection result) is reachable through a specific URL (endpoint), and actions on those resources are performed with standard HTTP methods:

- **GET** — retrieve data from the server (e.g. `GET /v1/results/{request_id}`).
- **POST** — send new data to the server (e.g. `POST /v1/detect/image`).
- **PUT / PATCH** — update existing data (e.g. update a tenant's quota).
- **DELETE** — remove data (e.g. revoke an API key).

Endpoints are organised by resource and verb. For example, `POST /v1/detect/image` and `POST /v1/detect/video` handle forgery detection, `POST /v1/detect/liveness` and `GET /v1/liveness/challenge` handle liveness, and `GET /v1/results/{request_id}` retrieves a stored result.

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

In short, the HTTP/REST API is the one JSON contract that ties DeepGuard's tiers together and exposes detection to external eKYC clients.

## 1.5 Domain Name System (DNS)

The **Domain Name System (DNS)** is a hierarchical, decentralised naming system. It translates human-readable domain names (e.g. `deepguard.vn`) into the numerical IP addresses (e.g. `203.0.113.10`) that computers use to find each other on the Internet. DNS is a foundational part of the modern web. It lets users reach a service by name without remembering an address, and it is the mechanism that points a public domain at the cloud host on which DeepGuard runs.

DNS operates through several components:

- **Domain registrars** — entities through which a domain name is registered and managed (e.g. Namecheap, GoDaddy, or a Vietnamese `.vn` registrar).
- **DNS records** — configuration entries such as A, CNAME, TXT, and MX records that determine how traffic for a domain is routed; the A record maps a name to an IPv4 address.

### 1.5.1 DNS servers

- **Authoritative DNS servers** hold the actual records for a domain and answer queries about it definitively.
- **Recursive resolvers** query DNS records on behalf of clients. They walk the hierarchy from the root down to the authoritative server and cache the result.

In DeepGuard, DNS is configured to map the public domain (and any subdomains, for example an `api.` host for the backend) to the Elastic IP of the AWS EC2 instance that hosts the containerised stack (Section 1.13). Proper DNS setup matters for three things: routing requests to the right host, enabling HTTPS through certificate management (an ACM-issued certificate), and keeping the public address stable across instance restarts. It is the first link in the chain that carries a request from the user's browser to the backend.

## 1.6 EfficientNet-B4

### 1.6.1 Why a strong spatial backbone is needed

The central scientific hypothesis of this thesis concerns the frequency domain. Even so, the detector still needs a strong spatial backbone as its spine, because many forgery traces are spatial by nature: skin-texture inconsistency, errors around the eyes and teeth, and lighting mismatches. The frequency branch is designed to complement this spatial stream, not to replace it. The backbone therefore has to be both powerful and parameter-efficient. The thesis adopts **EfficientNet-B4** as the spatial branch, building on the EfficientNet family of convolutional networks.

### 1.6.2 Compound scaling — the core idea of EfficientNet

EfficientNet [1] starts from a simple observation. When increasing a CNN's capacity, there are three knobs to turn: depth (number of layers), width (number of channels), and input resolution. Prior designs typically turned only one knob; ResNet, for example, went deeper. EfficientNet showed that turning all three knobs at the same time, in fixed proportion, gives a far better accuracy/FLOPs trade-off. This rule is called **compound scaling**. Given a resource coefficient $\phi$, the three dimensions are scaled as

$$
\text{depth} = \alpha^{\phi}, \quad \text{width} = \beta^{\phi}, \quad \text{resolution} = \gamma^{\phi},
$$

subject to the constraint $\alpha \cdot \beta^{2} \cdot \gamma^{2} \approx 2$ (keeping the FLOPs increase approximately $2^{\phi}$-fold), where $\alpha, \beta, \gamma$ are found by a small grid search on the base network. Increasing $\phi$ produces the B0 → B7 family; B4 is a well-balanced, mid-range point within it.

*Table 1.2: The three scaling dimensions of EfficientNet.*

| Scaling dimension | What is turned | Benefit | Risk if turned in isolation |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Number of layers | Captures more complex/abstract features | Harder to train (vanishing gradient) |
| Width ($\beta^\phi$) | Number of channels | Captures more fine-grained features | Saturation, poor parameter efficiency |
| Resolution ($\gamma^\phi$) | Input image size | Sees small details (subtle artifacts) | FLOPs grow rapidly |

### 1.6.3 The MBConv block — the building unit

The basic unit of EfficientNet is the **MBConv** block (Mobile Inverted Bottleneck Convolution), inherited from MobileNetV2. It works in three steps. First, an expand step uses a 1×1 convolution to raise the number of channels (e.g. ×6), creating a wide representation space. Second, a depthwise convolution, which is far cheaper than a full convolution, learns spatial patterns channel by channel. Third, a project step uses another 1×1 convolution to compress the channels back to a small number (the bottleneck). This expand-then-compress structure (the inverted bottleneck) lets the block learn rich representations while staying parameter-efficient.

Each block also includes a **Squeeze-and-Excitation (SE)** module [24], together with a residual connection when input and output dimensions match. The SE module learns a per-channel importance weight, amplifying useful channels and suppressing noisy ones.

One detail is worth noting for this thesis. The SE module is essentially a form of channel attention based on global statistics (global average pooling). Section 1.7.4 builds on this bridge: the FcaNet-based lever (S4) generalises SE by replacing average pooling with multiple DCT components, giving channel attention that is richer in frequency information.

![Figure 1.2 — MBConv block](figures/fig_1_2_mbconv.png)

*Figure 1.2: The MBConv block — expand 1×1 → depthwise convolution → Squeeze-and-Excitation → project 1×1, with a residual connection when dimensions match.*

### 1.6.4 Why B4 was chosen, and transfer learning from ImageNet

The choice of B4 (rather than the smaller B0 or the larger B7) rests on three reasons:

1. **Leaderboard comparison.** EfficientNet-B4 is the backbone commonly used in DeepfakeBench baselines. Choosing B4 therefore enables fair comparison and pipeline confirmation: the thesis B4 baseline reaches CDFv2 frame-AUC 0.7497, close to the DeepfakeBench-harmonized figure ≈ 0.7487, as discussed in Section 1.10.3.
2. **Resource balance.** B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU, allowing batch size 32 at 256×256 resolution.
3. **Suitable resolution.** B4 was originally designed for ~380 px input images. At 256×256 it still operates well and retains enough detail to capture small artifacts.

**Transfer learning.** The backbone is initialised with weights pretrained on ImageNet rather than trained from scratch. The low-level filters (edges, corners, textures) learned from millions of natural images are generic and immediately reusable, so only the higher layers need fine-tuning for the forgery-detection task. This saves data, shortens convergence time, and usually improves generalisation. Input images are normalised with mean = std = 0.5 (mapping pixels to $[-1, 1]$), in line with the thesis pipeline configuration. In summary, EfficientNet-B4 gives SFDCT a strong, parameter-efficient, ImageNet-pretrained spatial base to which the frequency branch is attached.

## 1.7 The Discrete Cosine Transform (DCT) and Frequency-Domain Analysis

### 1.7.1 Why use DCT rather than Fourier

Section 1.9 will argue that forgery artifacts are clearly revealed in the frequency domain. The first design decision is which transform should move an image into that domain. The thesis chooses the **DCT (Discrete Cosine Transform)** [10] over the DFT/FFT for three reasons. First, the DCT yields real coefficients, with no complex imaginary part as in the Fourier transform, so the output is easy to feed into a neural network. Second, the DCT has excellent energy compaction: it concentrates most of the signal's energy into a few low-frequency coefficients, so the high-frequency residual, where the artifacts live, stands out. Third, the DCT is exactly the transform that the JPEG standard applies to each 8×8 block, so block-DCT is the most natural way to inspect traces related to compression and the block grid.

### 1.7.2 One-dimensional and two-dimensional DCT

**One-dimensional DCT (1D-DCT).** Given a discrete signal $x[n]$, $n = 0,\dots,N-1$, the DCT-II (the most common type) defines the $k$-th frequency coefficient

$$
X[k] = c(k)\sum_{n=0}^{N-1} x[n]\,\cos\!\left[\frac{\pi (2n+1)k}{2N}\right], \quad k = 0,\dots,N-1,
$$

with normalisation $c(0) = \sqrt{1/N}$ and $c(k) = \sqrt{2/N}$ for $k \ge 1$. The intuition is simple: each $X[k]$ measures the similarity between the signal and a cosine of frequency $k$. The coefficient $X[0]$ (the DC term) is proportional to the signal's mean. Large-$k$ coefficients (the high-frequency AC terms) capture rapid variation such as sharp edges, noise, and fine patterns.

**Two-dimensional DCT (2D-DCT).** For an image block $B(i,j)$ of size $M \times N$, the 2D-DCT is the 1D-DCT applied successively along rows then columns (separable):

$$
F(u,v) = c(u)\,c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1} B(i,j)\,\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right].
$$

The result $F(u,v)$ is a grid of coefficients. The top-left corner $(0,0)$ is the DC term, which carries the coarse content; moving towards the bottom-right gives increasingly high frequencies in both directions.

*Table 1.3: Meaning of coefficient position in a 2D-DCT block.*

| Coefficient position $(u,v)$ | Name | What it captures | Relation to forgery artifacts |
|---|---|---|---|
| $(0,0)$ | DC | Average brightness of the block | Carries content → prone to content leakage |
| Near top-left corner | Low frequency | Slow variation, coarse shape | Few artifacts |
| Mid region | Mid frequency | Texture, moderate patterns | Upsampling/blending artifacts clearly revealed |
| Bottom-right corner | High frequency | Sharp edges, noise, fine detail | Frequency inconsistency, compression traces |

### 1.7.3 Block-wise DCT 8×8, zigzag scan, 16 bands, log-magnitude, and YCbCr

**Block-wise DCT 8×8 and the JPEG connection.** Applying the DCT to the whole image (global DCT) mixes global content and makes local artifacts hard to isolate. Instead, the thesis uses block-wise DCT 8×8: the image is divided into a grid of non-overlapping 8×8 blocks, and the 2D-DCT is applied independently to each block, which is exactly JPEG's processing unit. This brings three benefits. Artifacts are localised to local regions (a blending boundary affects only a few blocks around the edge). The grid matches the JPEG compression grid, so compression and forgery traces can be detected together. The computation is also cheap, thanks to fast 8×8 DCT algorithms. Each block yields 64 coefficients ordered DC → highest frequency.

**Zigzag scan and the 16 frequency bands.** The 64 coefficients are not used individually, because that would mean too many dimensions and too much noise. They are grouped into frequency bands via the zigzag scan: a path that starts at the DC corner, traverses the anti-diagonals, and ends at the highest-frequency coefficient. Coefficients on the same anti-diagonal share the same total frequency level $(u+v)$, so the zigzag arranges the 64 coefficients into a sequence of increasing frequency (the same order JPEG uses for encoding). The thesis groups them into 16 frequency bands from DC → high frequency, then computes per-band statistics (e.g. mean energy / log-magnitude) to form a compact, stable frequency feature. An important option is drop low bands. The DC and the lowest bands mainly carry content, and keeping them risks the model learning along image content (content leakage) rather than forgery traces. Removing them forces the frequency branch onto the mid–high bands, which is where the artifacts reside.

**Log-magnitude.** DCT coefficients span a huge dynamic range: the DC coefficient can be thousands of times larger than a high-frequency coefficient. If raw amplitudes were fed into a network, the small high-frequency coefficients, exactly where the artifacts are, would be numerically swallowed. The log-magnitude transform fixes this:

$$
D(u,v) = \log\big(1 + |F(u,v)|\big).
$$

The $\log(1+\cdot)$ compresses the dynamic range. Small coefficients are lifted into numerically meaningful signals, $\log(0)$ is avoided, and high-frequency artifact peaks become observable and learnable.

**The YCbCr colour space.** The DCT is applied not to RGB but to YCbCr, that is, the luminance channel Y and the two chrominance channels Cb and Cr. There are two reasons. YCbCr separates brightness from colour, mirroring the human visual system and the JPEG standard, and most frequency traces reside in Y. In addition, JPEG compresses Cb and Cr more heavily than Y (chroma subsampling), so their frequency statistics carry complementary compression/forgery information. Applying block-DCT independently on all three channels gives a more complete frequency picture than RGB or grayscale alone.

![Figure 1.3 — Zigzag scan and 16 frequency bands](figures/fig_1_3_zigzag.png)

*Figure 1.3: Zigzag scan over an 8×8 DCT block (left) and the grouping of the 64 coefficients into 16 frequency bands from DC to the highest frequency (right).*

**Summary of the chain.** Taken together, YCbCr → block-DCT 8×8 → zigzag → 16 bands → log-magnitude (→ drop low bands) turns a face image into a frequency representation that is compact, locally localised, normalised in dynamic range, and reduced in content. In this representation the forgery traces of Section 1.9.4, such as upsampling peaks, blending-boundary inconsistency, and frequency-statistics mismatch, become clear patterns that a lightweight branch can learn. This chain is the input to SFDCT's frequency branch.

### 1.7.4 Inherited frequency cues — the foundations of the five levers (S1–S5)

The block-DCT branch above is the naive SFDCT input. On top of it, the thesis studies five optional improvement levers $S1$–$S5$. Each lever adapts the original principle of a prior work into the block-DCT domain. The system is built on DeepfakeBench, and the levers adapt the published ideas of SPSL, SRM, FcaNet, FreqDebias, and FDFL. This section gives only the theoretical basis, that is, the original idea and the direction of adaptation; the implementation formulas are reserved for Chapter 2.

**S1 — SPSL → phase-analog sign (`dct_use_sign`).** SPSL (Spatial-Phase Shallow Learning) showed that the phase spectrum, not just the magnitude, carries important upsampling traces and generalises well. The DCT yields real coefficients and so has no Fourier-style phase. However, the sign of a DCT coefficient is analogous to phase: it encodes the direction of the cosine component. The S1 lever therefore adds the sign of the DCT coefficients to the frequency feature (instead of using only log-magnitude, which discards it). This provides a phase-analog signal without leaving the DCT domain.

**S2 — SRM → high-pass noise residual (`dct_srm_residual`).** SRM (Spatial Rich Model), from steganalysis, uses a bank of fixed high-pass filters to extract a noise residual, the signal that remains after low-frequency content is removed. On this residual, high-frequency forgery traces stand out far more, because the content has been suppressed. The S2 lever applies block-DCT not on the raw image but on an SRM-style high-pass residual. The content is filtered out first, so the subsequent block-DCT inspects only the noise that contains the artifacts.

**S4 — FcaNet → multi-spectral channel attention (`dct_fca_attention`).** FcaNet generalises the Squeeze-and-Excitation module. SE compresses each feature map into one number via global average pooling, and average pooling is exactly the DC component (frequency 0) of the DCT. FcaNet argues that using only the DC discards information. It instead uses multiple DCT frequency components across channels, forming a more information-rich multi-spectral channel attention. The S4 lever brings FcaNet's multi-spectral attention layer into the architecture, so the network learns channel attention using the DCT components themselves. Both the backbone (via SE) and S4 are channel attention; S4 is simply richer in frequency.

**S3 — FreqDebias → frequency mixup and consistency (`use_dct_fomixup`).** FreqDebias targets frequency bias: detectors tend to latch onto one tell-tale band of the training set, which hurts generalisation. The remedy mixes frequency information across samples to break the rigid dependence, and adds a consistency constraint that forces predictions to remain stable under those mixes. The S3 lever performs DCTFoMixup, which mixes DCT bands across samples and then applies an inverse DCT back to the image (frequency-domain augmentation), with a dual consistency loss (symmetric-KL on probabilities plus MSE on embeddings). S3 adds no learnable parameters; it changes only data generation and the loss, and is therefore present in both Row1 and Row2.

**S5 — FDFL → single-center loss (`use_single_center_loss`).** FDFL (Frequency-aware Discriminative Feature Learning) improves the discriminativeness of the feature space via a single-center loss. Rather than letting REAL and FAKE scatter arbitrarily, it compresses all REAL samples towards a single center in the embedding space while pushing FAKE away by a margin. The intuition is that REAL is a homogeneous concept (natural statistics), whereas FAKE is diverse (many pipelines). Compressing REAL tightly and treating samples far from the cluster as suspicious therefore generalises well to unseen fakes. The S5 lever adds this loss, pushing FAKE away by a margin proportional to $\sqrt{D}$ (with $D$ the embedding dimension). It adds parameters (the center coordinates) and appears in Row2 together with S4.

*Table 1.4: The five levers S1–S5 — source paper, principle, and configuration in which each appears.*

| Lever | Flag name | Source paper | Core principle | Adds parameters? | Present in |
|---|---|---|---|---|---|
| S1 | `dct_use_sign` | SPSL [6] | Adds the DCT coefficient sign (phase-analog) | No | Row1 |
| S2 | `dct_srm_residual` | SRM [7] | Block-DCT on the high-pass residual | No | Row1 |
| S3 | `use_dct_fomixup` | FreqDebias [12] | Frequency mixup + dual consistency | No | Row1, Row2 |
| S4 | `dct_fca_attention` | FcaNet [5] | Multi-spectral channel attention (DCT) | Yes | Row2 |
| S5 | `use_single_center_loss` | FDFL [11] | Single-center loss (compress REAL to 1 center) | Yes | Row2 |

This organisation yields two configurations with a clear story. Row1 = naive + S1+S2+S3: no added learnable parameters, only a changed input feature and loss. Row2 = naive + S4+S5+S3: added learnable parameters (FcaNet + single-center loss). Splitting by whether parameters are added makes it possible to tell whether any AUC change comes from a better feature or from more capacity. The actual per-lever effect is an empirical question reported in Chapter 3, and Row1's measured result is in fact a negative one (see Section 1.10 and Chapter 3). Within the thesis GPU budget, Row2 was not trained. Instead, two single-axis variants (Fix1 = sign + drop-low-band, Fix2 = FcaNet-style attention) trained under the identical recipe provide a partial per-lever decomposition in Chapter 3, and the full one-lever-at-a-time table is left as future work.

## 1.8 Attention Mechanisms and Feature Fusion

### 1.8.1 Why attention is needed to fuse the two branches

At this point we have two information streams: spatial features from EfficientNet-B4 and frequency features from the block-DCT branch. The remaining question is how to combine them. The crudest approach, concatenation plus a fully-connected layer, has two drawbacks. It mixes the two streams indiscriminately, so the model has no way to decide when and where the frequency information is trustworthy. It also breaks equivalence with the original backbone, so the fused model is no longer guaranteed to be at least as good as B4. The **attention** mechanism solves both problems by letting the spatial features actively and selectively query the frequency features.

### 1.8.2 Self-attention and cross-attention

**Self-attention** lets each position in a feature sequence look at every other position and aggregate information weighted by relevance. It uses three projection matrices: Query ($Q$), Key ($K$), and Value ($V$). The scaled dot-product attention [30] is

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V,
$$

where $QK^\top$ measures query–key similarity (the attention weights), $\sqrt{d_k}$ is the scaling that prevents softmax saturation, and multiplication by $V$ returns a weighted combination of the values. In words: for each query $Q$, take a weighted average of the values $V$, with high weight where $K$ matches $Q$.

**Cross-attention** is the variant in which $Q$ comes from one source while $K, V$ come from another. Fusion needs this form. SFDCT sets $Q$ = spatial features and $K, V$ = frequency (DCT) features. Each spatial position then asks the frequency branch which frequency traces are relevant in its region, and retrieves a context vector aggregated from the most relevant DCT features. The gated cross-attention in SFDCT uses this mechanism to inject frequency information into the spatial stream.

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

where $x$ is the spatial feature, $\text{context}(\text{DCT})$ is the cross-attention frequency context, and $\alpha$ is learnable. Intuitively, $\alpha$ acts as a volume control for the frequency branch. If the frequency information is useful during training, the gradient pushes $\alpha$ up and the gate opens. If it is noisy or useless, $\alpha$ is driven towards 0 and the gate closes. The learned $\alpha$ is therefore a quantitative indicator of how much the frequency branch contributes, which the thesis visualises (Figure 3.13, `gate_alpha.png`).

### 1.8.4 Zero-init: why it guarantees a floor ≥ backbone

This design choice is central from a risk standpoint. SFDCT initialises $\alpha = 0$ at the start of training (**zero-init**). Consequently, at initialisation,

$$
\text{feature}_{\text{fused}} = x + 0 \cdot \text{context}(\text{DCT}) = x,
$$

so the model is exactly equal to a pure EfficientNet-B4: the entire frequency branch does not perturb the pretrained spatial stream. Training then opens $\alpha$ gradually, and only if the frequency information genuinely reduces the loss. The result is a guaranteed floor. In the worst case, with a useless frequency branch, $\alpha$ stays near 0 and the model is never worse than B4. Because of this property, the thesis can describe the architecture as risk-safe, which matters in the eKYC context where reliability comes first.

One distinction should be kept clear when SFDCT is contrasted with SFCL-HCMF in later chapters. SFDCT's gate is initialised to 0, giving a strict floor of the B4 backbone, and there is no global-differential / SIDA branch: SFDCT is purely EfficientNet-B4 (spatial) plus an 8×8 block-DCT branch plus zero-init gated cross-attention fusion. SFCL-HCMF's gate initialises at 0.5, so it carries no such floor guarantee.

![Figure 1.4 — Zero-init gated cross-attention fusion](figures/fig_1_4_gate_fusion.png)

*Figure 1.4: Gated cross-attention fusion with the zero-initialised α gate — at initialisation the frequency branch is closed (α = 0) and the model is exactly the B4 backbone.*

## 1.9 Overview of Deepfake Technology

### 1.9.1 Why we must understand how deepfakes are generated

Before building a detector, we must understand how the adversary creates fake images, because every generation method leaves a fingerprint that is characteristic of its pipeline. If we understand the pixel transformations a generative algorithm performs, we know where to look for the traces. We also know in which representation domain, spatial or frequency, those traces are most visible. The thesis builds on this point: it argues that certain traces are almost invisible in the spatial domain yet loud in the mid/high DCT bands.

### 1.9.2 Three families of face-forgery techniques

The term "deepfake" covers many techniques, reducible to three dominant architectural families:

**(a) Autoencoder face-swap.** This is the classic architecture behind tools like FaceSwap/DeepFaceLab: two autoencoders share an encoder but have separate decoders for identities A and B. The encoder learns an identity-invariant latent (pose, expression, lighting). At inference, face A is encoded and then decoded by B's decoder, giving face B with A's pose and expression. The final step always blends the generated face back into the original frame, and that blending step creates the blending boundary.

**(b) GAN (Generative Adversarial Network)** [23]**.** A generator learns to turn noise or input images into fakes, competing against a discriminator that learns to tell real from fake. The two train adversarially until the fakes fool the discriminator. GANs power many high-quality face synthesisers (e.g. StyleGAN). The key point for this thesis is the upsampling path: the generator builds a high-resolution image from a low-resolution tensor through upsampling layers (transposed convolution or interpolation + convolution), leaving upsampling artifacts, periodic patterns that show up as abnormal spectral peaks.

**(c) Diffusion model.** The newest family synthesises images by learning to reverse a gradual noising process: starting from Gaussian noise, a denoising network iterates to reconstruct an image. Diffusion gives very high quality but still leaves frequency statistics that differ from natural photographs. In the scope of this thesis, diffusion is noted as a trend the detector should eventually generalise to (future work), while the main training data (FF++) belongs to the first two families.

![Figure 1.5 — Three face-generation pipelines](figures/fig_1_5_pipelines.png)

*Figure 1.5: The three face-generation families (autoencoder face-swap, GAN, diffusion); all converge on a final upsampling/blending step that leaves frequency-domain artifacts.*

### 1.9.3 Four forgery families in FaceForensics++

The standard FaceForensics++ (FF++) dataset [2] aggregates four forgery methods spanning two manipulation types, identity swap and expression reenactment:

*Table 1.6: The four forgery families in FF++ — mechanism and characteristic trace.*

| Method | Manipulation type | Core mechanism | Characteristic trace |
|---|---|---|---|
| **Deepfakes** | Identity swap | Autoencoder swaps identity then blends into the frame | Blending boundary, texture inconsistency between face region and background |
| **Face2Face** | Expression reenactment | 3D-model-based expression reenactment, re-rendering the mouth/face region | Rendering errors, boundary noise around the reenacted region |
| **FaceSwap** | Identity swap | Graphics-based face swap, matching 3D landmarks then blending | Rigid geometric seams, lighting inconsistency |
| **NeuralTextures** | Expression reenactment | Learned neural textures + differentiable rendering (neural rendering) | Subtle artifacts around the mouth, hard to see in the spatial domain |

These four span both deep-learning-based manipulations (Deepfakes, NeuralTextures) and traditional graphics-based ones (Face2Face, FaceSwap). The mix forces the detector to learn common traces rather than memorising a single artifact type.

### 1.9.4 Forgery traces: weak in the spatial domain, clear in the frequency domain

This subsection states the central hypothesis of the work, so the intuition deserves a careful walk-through. The three most common trace types are:

1. **Blending boundary.** When the generated face is blended in, two regions with different statistics (sharpness, sensor-noise level, colour balance) are forced to meet. In the pixel domain, smoothing (feathering, Poisson blending) makes the boundary almost invisible. However, the smoothing alters the local frequency structure: it abnormally suppresses high-frequency energy around the boundary.

2. **Upsampling artifact.** The upsampling layers of a GAN/decoder produce periodic grid-like patterns. The eye barely perceives them, but in the DCT/Fourier spectrum they appear as energy peaks localised in the mid/high bands.

3. **Frequency inconsistency.** A real camera's processing chain (demosaicing, JPEG) produces a natural, consistent frequency signature across the image. Fakes composited from multiple sources, or passed through a generative network, violate this consistency. They leave phase/amplitude mismatches across bands.

These observations shape the design. A spatial CNN learns filters over the pixel grid; it can indirectly capture some frequency artifacts, but it does so inefficiently, because the traces are tiny and buried in image content. Actively projecting the image into the frequency domain (via block-DCT) pulls the artifacts out into discrete coefficients that are easy to separate from content. That gap between the two representations motivates the frequency branch running parallel to the spatial backbone in SFDCT's two-branch architecture.

A real measured example of this contrast, a real/fake pair whose difference is near-invisible in the pixel domain yet clearly separated in the log-magnitude DCT spectrum, is shown with the thesis's own data in Figure 3.2, and the per-band energy comparison appears in Figure 3.11 (Chapter 3).

## 1.10 The Deepfake Detection Problem and the Generalisation Challenge

### 1.10.1 Definition of the binary classification problem

At its most basic, deepfake detection is a frame-level binary classification problem: given a face image $x$, the model $f_\theta$ outputs

$$
\hat{y} = f_\theta(x) \in [0, 1],
$$

the probability that the image is FAKE; the ground-truth label is $y \in \{0, 1\}$ with $0 = $ REAL, $1 = $ FAKE. Training uses binary cross-entropy:

$$
\mathcal{L}_{\text{BCE}} = -\big[\, y \log \hat{y} + (1 - y)\log(1 - \hat{y}) \,\big].
$$

Because the problem is frame-level, a video is scored by aggregating per-frame probabilities (e.g. averaging). The main metric of this thesis, however, is **frame-level AUC**, a direct measure of real–fake separability at the image level.

AUC is preferred over accuracy for a clear reason. Accuracy depends on a fixed threshold and is highly sensitive to class imbalance, and deepfake sets are typically skewed. AUC (Area Under the ROC Curve) [21] measures the probability that the model ranks a random FAKE above a random REAL, independently of any threshold. For this reason it is the de-facto standard in deepfake benchmarks.

*Table 1.7: Mapping of the problem symbols.*

| Symbol | Role | Meaning |
|---|---|---|
| $x$ | Input | 256×256 face-crop image |
| $f_\theta$ | Model | Detector with parameters $\theta$ |
| $\hat{y}$ | Output | Probability of being FAKE, $\in [0,1]$ |
| $y$ | Label | 0 = REAL, 1 = FAKE |
| AUC | Metric | Real–fake separability, threshold-independent |

### 1.10.2 The paradox: high in-dataset, dropping cross-dataset

A modern model trained and tested on the same dataset (in-dataset) usually attains a very high AUC on FF++. Tested on a different dataset (cross-dataset) such as Celeb-DF-v2, the same model typically drops sharply. This gap is the **generalisation paradox** and the central challenge of this thesis.

The cause of the drop is a form of shortcut learning. The model learns to rely on method-specific artifacts of one pipeline rather than on common traces shared by all forgery types. A model may, for instance, learn that Deepfakes-FF++ images exhibit an upsampling grid at frequency $k$. That pattern vanishes on Celeb-DF, which uses a different pipeline, so the cue the model depends on is gone. In effect, the model has overfitted to the training set's artifacts.

The design implication follows directly. To generalise, the model must be steered towards pipeline-invariant traces. The thesis therefore prioritises the frequency domain: shared physical principles (every generator must upsample; every blend breaks frequency consistency) produce more universal traces than any specific spatial texture. For the same reason, the evaluation protocol deliberately trains and tests on different datasets (FF++ → CDFv2), so that it measures exactly the property we care about: generalisation.

### 1.10.3 Robustness to compression, standard datasets, and the DeepfakeBench protocol

**Robustness to compression.** In the real eKYC setting, uploaded images and videos are almost always compressed (JPEG for images, H.264 for video). Compression erases part of the high-frequency energy where many artifacts live, and it also introduces block artifacts (JPEG's 8×8 grid) that can be confused with forgery traces. FF++ is therefore used at the c23 level (moderate compression, H.264 CRF 23), which is realistic: neither too ideal (raw) nor too heavy (c40). Training on c23 exposes the model to a degradation level close to operating conditions. A useful eKYC detector must be robust to compression, and this is an implicit criterion in the frequency branch, which prioritises bands that remain stable under compression.

**FaceForensics++ (c23) — training set.** FF++ is the foundational face-forgery dataset: 1000 real videos (from YouTube) and four corresponding fake sets (Deepfakes, Face2Face, FaceSwap, NeuralTextures). Each level is released as raw, c23 (light–moderate, H.264 CRF 23), and c40 (heavy). The thesis uses c23 to balance realism with retaining enough frequency traces to learn.

**Celeb-DF-v2 — cross-dataset test set.** CDFv2 [3] is a high-quality deepfake dataset, harder than FF++: 590 real videos of celebrities and 5639 deepfake videos refined to remove the coarse artifacts (colour flicker, visible boundaries) of older sets. Because its synthesis pipeline is entirely different from FF++, it is an ideal generalisation test. CDFv2 is used only for testing and never for training, which is a mandatory condition of fair cross-dataset evaluation.

**The DeepfakeBench evaluation protocol.** The system is built on DeepfakeBench [4], a framework that standardises training and evaluation. It removes the inconsistencies (in pre-processing, splitting, and metric computation) that make cross-paper numbers hard to compare. The thesis protocol follows it:

- Train on FF++ (c23).
- Cross-dataset test on Celeb-DF-v2.
- Main metric: frame-level AUC on CDFv2.
- Standard hyperparameters: batch size 32, frame_num 32, Adam optimizer [25], learning rate 2e-4, 256×256 input.

Adhering to DeepfakeBench enables direct leaderboard comparison. The thesis EfficientNet-B4 baseline attains a CDFv2 frame-AUC of 0.7497, close to the harmonized leaderboard figure (≈ 0.7487), which confirms the pipeline is built correctly before any improvement is attempted. The naive SFDCT reaches 0.7572 (Δ +0.0075 over B4, within noise; this thesis makes no SOTA claim, and SPSL at 0.7650 still beats it). The Row1 lever variant in fact measures 0.7333 (Δ −0.0164, below the baseline, an honest negative result discussed in Chapter 3). Row2 was not trained within the thesis GPU budget and is left as future work. The strongest measured member of the family is the block-DCT-HFF architectural variant (R3, Section 2.3.6), which reaches 0.7695. This is still below SPSL, and its paired bootstrap confidence interval contains zero (Chapter 3).

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

## 1.11 The eKYC Application Context and Legal Requirements

### 1.11.1 What eKYC is and its anti-deepfake role

**eKYC (electronic Know Your Customer)** is the process of identifying customers electronically. Instead of visiting a counter, users photograph their documents and faces with a phone to open an account or transact. Its core step is face matching between the selfie and the document photo, together with an anti-spoofing step. Deepfakes threaten exactly this step: a fraudster can use deepfake images or videos of a victim's face to bypass verification, open accounts illegitimately, or hijack accounts. A deepfake detector that generalises well to unseen pipelines is therefore an essential defence layer for eKYC, and this is the applied motivation of the entire thesis.

### 1.11.2 Circular 17/2024/TT-NHNN and the FPR ≤ 5% operating point (our convention)

In Vietnam, **Circular 17/2024/TT-NHNN** [14] regulates the opening and use of payment accounts and mandates biometric authentication for certain banking transactions. One point must be stated precisely. Circular 17 imposes a qualitative requirement, namely mandatory biometric matching, but it does not specify a concrete quantitative threshold; no FPR or FAR figure is mandated. To turn this qualitative requirement into something measurable, this thesis adopts the operating point FPR ≤ 5% following the ISO/IEC 30107-3 convention [13] (BPCER at APCER = 5%). In our context, FPR is the proportion of real images misclassified as fake, so the constraint FPR ≤ 5% means the system must not reject more than 5% of legitimate users. In short, we adopt FPR ≤ 5% per ISO/IEC 30107-3 to satisfy TT17's qualitative biometric-verification requirement; the 5% figure is our choice under an international standard, not a figure mandated by TT17.

The technical implication is threshold calibration. AUC measures separability independently of any threshold, but deployment forces a concrete decision threshold $\tau$. To satisfy FPR ≤ 5% we calibrate $\tau$ on a validation set: find the threshold at which the real-flagged-as-fake rate does not exceed 5%, then report the TPR (fakes caught) at that threshold. This separates model capability (AUC) from the operating point, and it is mandatory for any serious eKYC deployment. For the naive SFDCT, this calibration yields $\tau =$ 0.9514 at FPR = 0.0500, giving TPR = 0.2298, accuracy 0.476, and F1 0.366 (confusion at $\tau$: TN 5339, FP 281, FN 8318, TP 2482). The plain reading is that at a strict 5% false-reject budget, on a cross-dataset model of AUC ≈ 0.75, the true-positive rate collapses to about 23%. The model is a useful risk signal, not an automatic gatekeeper.

### 1.11.3 The need for XAI (explainability)

In a tightly regulated financial setting, a REAL/FAKE decision cannot be a black box. When the system rejects a transaction, explainable evidence is needed for auditing and appeals. The thesis meets this requirement with **Grad-CAM** [9], a technique that highlights, as a heat-map, the image regions on which the model relies. The eKYC demo outputs `prob_fake` together with a Grad-CAM overlay, so an operator can see where the model is looking (e.g. the blending-boundary region around the chin). An abstract score becomes an intuitive explanation, consistent with banking transparency requirements.

## 1.12 Liveness Detection (Face Anti-Spoofing) Theory

Liveness detection (**Face Anti-Spoofing**, FAS) is a secondary, measured module of this thesis. It reuses the SFDCT backbone, comparing B4 (spatial-only) against B4 + block-DCT on the LCC-FASD dataset [28], with NUAA [26] as a sanity reference. It is designed as a cascade pre-filter (liveness → deepfake) in the eKYC pipeline. The pre-registered targets (ACER ≈ 16%, AUC ≈ 0.92) were both cleared by the measured results: B4 reaches ACER 6.85% / AUC 0.9829 on the official evaluation split (§3.1.8). This section presents the theory; the method and the measured results are in Chapters 2 and 3.

### 1.12.1 What liveness detection is, and where it sits in eKYC

Deepfake detection asks whether a face was digitally synthesised. **Liveness detection / Presentation Attack Detection (PAD)** asks a complementary question: whether a live person is physically present in front of the camera, or whether the camera is being shown an artefact. In an eKYC pipeline the two are layered. A liveness pre-filter first rejects obvious presentation attacks, such as a photo, a phone screen, or a printed mask, and only genuinely live captures proceed to deepfake and document checks. This cascade ordering is efficient, because the cheap liveness check screens out the easiest attacks before the heavier deepfake model runs.

### 1.12.2 Taxonomy of presentation attacks (PAI)

A **Presentation Attack Instrument (PAI)** is the physical artefact used to spoof the system. The common categories are:

- **Print attack** — a printed photograph (paper, poster, A4) of the target's face is held up to the camera. Its characteristic traces are halftone/printing noise and the loss of fine 3D facial detail.
- **Replay attack** — a video or photo of the target is replayed on a screen (phone, tablet, monitor). Its main trace is the moiré pattern: the screen's pixel grid superimposed on the camera's sensor grid produces interference fringes that appear as spurious peaks in the frequency spectrum, largely absent in a live capture.
- **3D mask attack** — a wearable mask (paper, silicone, resin) reproduces facial geometry. These are rarer and harder, often requiring depth/IR or pulse cues to defeat. They are noted here for completeness but are outside the cheap, RGB-only scope of this module.

This taxonomy matters for the frequency hypothesis. Replay artifacts (moiré) are especially loud in the DCT/Fourier domain, the physical analogue of the deepfake hypothesis about GAN/upsampling artifacts in the mid/high bands. The SFDCT block-DCT branch therefore has a principled reason to help liveness too. To be honest about the limits, the effect is attack-dependent: moiré is strong for replay and weak for print, which leaves halftone noise instead, so the frequency branch is expected to help replay more than print. A per-attack APCER/BPCER decomposition is left as future work.

### 1.12.3 Passive vs. active liveness

- **Passive liveness** analyses a single captured frame (or a short clip) for spoof cues, such as texture, frequency artifacts, and micro-detail, without asking the user to do anything. It is frictionless, and it is the approach this thesis adopts because it reuses the single-frame SFDCT pipeline directly.
- **Active (challenge-response) liveness** asks the user to perform an action, for example blink, turn the head, follow a moving dot, or read a number, and verifies the response. It is more robust to replay and print attacks, but it adds friction and requires temporal/video processing, so it is out of scope for the cheap reuse-SFDCT plan.

### 1.12.4 Metrics: APCER, BPCER, ACER

Liveness performance is reported with the **ISO/IEC 30107-3** metrics, treating spoof/attack as the positive class:

- **APCER (Attack Presentation Classification Error Rate)** — the fraction of attacks misclassified as bona fide (a spoof getting through, the dangerous error). Reported as the worst case (max) over PAI types.
- **BPCER (Bona-fide Presentation Classification Error Rate)** — the fraction of genuine presentations misclassified as attacks (a real user wrongly rejected).
- **ACER (Average Classification Error Rate)** — the mean of the two, $\text{ACER} = \tfrac{1}{2}(\text{APCER} + \text{BPCER})$, an overall intra-dataset score at one threshold.

For cross-dataset evaluation the equivalent quantity is HTER $= \tfrac{1}{2}(\text{FAR}+\text{FRR})$ (equal to ACER when positive = spoof), and AUC/EER are reported threshold-independently, as for deepfake. Following honest reporting discipline, the operating threshold is chosen at EER on a dev/validation set and then fixed to compute HTER/ACER on the test set. For the eKYC tie-in, the module also reports BPCER @ APCER ≤ 5%, mirroring the FPR ≤ 5% convention of Section 1.11.2.

*Table 1.9: Liveness (PAD) metrics and when each is used.*

| Metric | Formula (positive = spoof) | Used for |
|---|---|---|
| APCER | FP / (TN+FP), worst-case max over PAI | spoof wrongly accepted (dangerous) |
| BPCER | FN / (TP+FN) | genuine user wrongly rejected |
| ACER | ½(APCER + BPCER) | overall intra-dataset @ one threshold |
| HTER | ½(FAR + FRR) | cross-dataset generalisation |
| EER | error where FAR = FRR | balanced operating point |
| AUC | area under ROC, threshold-independent | direct B4 vs. B4+DCT comparison |

The pre-registered targets for the liveness module were ACER ≈ 16% and AUC ≈ 0.92. The measured results on the official LCC-FASD evaluation split (Section 3.1.8) clear both with margin: ACER 6.85% / AUC 0.9829 for the B4 head, and 7.54% / 0.9776 for B4+DCT. On this dataset the spatial B4 head already performs well, and the frequency branch does not improve it.

## 1.13 Amazon Web Services (AWS)

Amazon Web Services (AWS) is the most comprehensive and widely adopted cloud platform in the world. It offers hundreds of services from global data centres, letting individuals and organisations build infrastructure, store and process data, distribute content, and manage applications without owning physical hardware. DeepGuard is deployed onto AWS so that the same containerised stack validated locally under Docker Compose runs unchanged in the cloud. The relevant services are described below.

- **EC2 (Elastic Compute Cloud).** EC2 provides scalable virtual servers (instances) in the cloud, configurable with a chosen OS, CPU, RAM, and storage. In DeepGuard, a single EC2 instance is the production host on which Docker Compose runs the frontend, backend, SFDCT microservice, and PostgreSQL containers as one unit. Because serving runs on CPU, the instance is sized for RAM rather than raw compute: a `t3.large`-class instance (2 vCPU / 8 GB RAM) lets PyTorch + MTCNN, the API, the database, and the frontend all reside without swapping.

- **Lambda (Serverless Computing).** AWS Lambda runs code without provisioning or managing servers. The developer uploads code and defines an event trigger, for example a file uploaded to S3 or an HTTP request, and Lambda executes in response. It is described here as a complementary serverless option in the AWS toolkit for event-driven tasks around the platform.

- **S3 (Simple Storage Service).** Amazon S3 is an object-storage service for storing and retrieving data, such as images, videos, documents, and backups, as objects inside buckets, managed via the Console, APIs, or SDKs. It is the natural place to hold uploaded eKYC media, model checkpoints, and exported audit artefacts.

- **CloudFront.** Amazon CloudFront is a Content Delivery Network (CDN) that speeds up the delivery of static and dynamic content through a global network of edge locations. It is commonly used to serve images, video, and web assets, for example the Next.js frontend's static bundle.

- **ACM (AWS Certificate Manager).** ACM provides free SSL/TLS certificates for securing HTTPS traffic. In DeepGuard, ACM (or an equivalent ACME flow) supplies the certificate for the public domain, so all browser traffic and all external eKYC integrations travel over HTTPS to the reverse proxy.

- **CloudWatch Logs (Monitoring and Logging).** Amazon CloudWatch Logs collects and stores logs from EC2, Lambda, and other resources. In DeepGuard it monitors backend inference activity, tracks error rates and performance bottlenecks, and triggers alerts (for example a notification to Google Chat) when an anomaly occurs. This is the monitoring-and-alerting tier of the architecture.

- **Elastic IP.** An Elastic IP is a static, public IPv4 address assigned to an EC2 instance. It keeps the backend reachable at a fixed address even after instance restarts. This stable address is what the DNS A-record (Section 1.5) points to, binding the public domain to the host.

Together, these services let the containerised stack that was validated locally run unchanged in the cloud, behind a stable and secured public address.

## 1.14 Conclusion

This chapter has set out both the engineering and the scientific foundations of the DeepGuard platform and its SFDCT detector. On the engineering side, we covered the web stack that makes the system usable: JavaScript as the browser's behavioural layer, Next.js/React for the single-page dashboard, FastAPI as the guarded API gateway, the HTTP/REST contract that ties the tiers and external eKYC clients together, and DNS mapping the public domain to the host. On the scientific side, we built the detector up from its parts. The EfficientNet-B4 spatial backbone contributes compound scaling, MBConv blocks, and ImageNet transfer learning. The block-wise 8×8 DCT representation (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) supplies the frequency feature, together with the foundations of the five levers (§1.7.4), all built on DeepfakeBench. Gated cross-attention with a zero-init $\alpha$ gate fuses the two branches and guarantees a floor no worse than B4, a property that SFCL-HCMF's 0.5-initialised gate does not provide.

We then grounded these tools in their domain. Deepfakes are generated by autoencoder swap, GANs, and diffusion, with four forgery families in FF++, and the central hypothesis is that forgery traces are weak in pixels but loud in the mid/high frequency bands. The generalisation paradox (high in-dataset, dropping cross-dataset) motivates the FF++ → CDFv2 protocol, under which the honest standings of the B4 baseline and the naive SFDCT, both behind SPSL, are reported in Section 1.10.3. The eKYC context turns TT17's qualitative biometric mandate into our FPR ≤ 5% operating point per ISO/IEC 30107-3 (Section 1.11.2), with Grad-CAM supplying the explainability that a regulated setting needs. The secondary liveness module adds the PAD taxonomy of print, replay, and mask attacks, the passive-versus-active distinction, and the APCER/BPCER/ACER metrics, with its pre-registered targets cleared by the measured results (§3.1.8). Finally, we surveyed the AWS services that carry the platform into the cloud.

On this foundation, Chapter 2 presents the system analysis and design in detail: the requirements, the use-cases and architecture, the deepfake-detection method (data pipeline, SFDCT architecture, the five-lever/four-ablation design space, loss, and risk-score decision inference), and the secondary liveness-detection method (measured in §3.1.8).
