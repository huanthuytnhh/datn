# 11 sơ đồ Mermaid — PL04_B (xem render trong VS Code / mermaid.live)


## Figure 1.1: REST API Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant S as REST API Server
    C->>S: HTTP request - method + URL + headers + JSON body
    S->>S: Route to resource, validate, run logic
    S-->>C: HTTP response - status code + headers + JSON body
```


## Figure 2.1: Overview use case diagram.

```mermaid
flowchart LR
Anon([Anonymous])
Viewer([Viewer])
Dev([Developer])
Comp([Compliance])
Admin([Admin])
Sys([Sysadmin])
Client([External eKYC client])
subgraph DeepGuard[DeepGuard platform]
UC1((Detect image))
UC2((Detect video))
UC3((Liveness check))
UC4((Register organisation))
UC5((Approve tenant))
UC6((Manage API keys))
UC7((Manage team))
UC8((Review and add note))
UCv((View history and analytics))
end
Anon --> UC4
Viewer --> UCv
Dev --> UCv
Dev --> UC1
Dev --> UC2
Dev --> UC3
Dev --> UC6
Comp --> UC8
Admin --> UC6
Admin --> UC7
Sys --> UC5
Client --> UC1
Client --> UC2
Client --> UC3
```


## Figure 2.3: Activity diagram for deepfake image detection.

```mermaid
flowchart TD
A([Start]) --> B[User selects an image]
B --> C{Token valid and role allowed?}
C -- No --> E[Reject the request] --> Z([End])
C -- Yes --> F{Quota available?}
F -- No --> G[Refuse: quota exhausted] --> Z
F -- Yes --> H[Detect and crop the face]
H --> I{Face found?}
I -- No --> J[Return: no face detected] --> Z
I -- Yes --> L[Send the crop to the model service]
L --> M[Forward pass gives a probability]
M --> O{Map the probability to a band}
O -- "high" --> P[verdict = fake]
O -- "low" --> Q[verdict = real]
O -- "near the threshold" --> R[verdict = uncertain]
P --> T[Render the score, band, and heat map]
Q --> T
R --> T
T --> Z
```


## Figure 2.4: Activity diagram for the eKYC cascade.

```mermaid
flowchart TD
A([Start: a face frame]) --> B[Liveness check with an API key]
B --> H{Liveness band}
H -- "spoof" --> I[Reject: presentation attack] --> Z([End])
H -- "uncertain" --> J[Request a retry] --> Z
H -- "live" --> L[Deepfake stage on the same frame]
L --> N{Deepfake band}
N -- "fake" --> O[Reject: deepfake suspected] --> Z
N -- "uncertain" --> P[Escalate to manual review] --> Z
N -- "real" --> Q[Approve: live and genuine] --> Z
```


## Figure 2.5: Deepfake detection sequence diagram.

```mermaid
sequenceDiagram
actor U as User
participant FE as Frontend
participant BE as Backend
participant ML as Model service
U->>FE: Upload an image
FE->>BE: Send the image with a login token
BE->>BE: Check the role and quota, crop the face
BE->>ML: Send the cropped face
ML-->>BE: Return the probability, verdict, and heat map
BE->>BE: Map the probability to a band
BE-->>FE: Return the score, band, and heat map
FE-->>U: Render the result
```


## Figure 2.6: eKYC cascade sequence diagram.

```mermaid
sequenceDiagram
participant C as Customer backend
participant API as Backend
participant SF as Model service
C->>API: Liveness check with an API key
API->>SF: Send the crop to the liveness head
SF-->>API: Return the score and verdict
alt spoof or uncertain
API-->>C: Return spoof or uncertain
else live
C->>API: Deepfake stage on the same frame
API->>SF: Send the crop to the deepfake head
SF-->>API: Return the probability and verdict
API-->>C: Return the combined outcome
end
```


## Figure 2.7: Overall architecture of SFDCT.

```mermaid
flowchart LR
    IN[Face crop 256x256] --> SP[Spatial branch<br/>EfficientNet-B4]
    IN --> Y[RGB to YCbCr]
    Y --> D[Block-wise 8x8 DCT]
    D --> LG[log-magnitude]
    LG --> BD[16 zigzag bands<br/>mean and std]
    SP --> GF[Gated cross-attention<br/>gate alpha = 0 at init]
    BD --> GF
    GF --> HD[Classifier head]
    HD --> OUT[prob_fake + Grad-CAM]
```


## Figure 2.8: Overall architecture of SFDCT-HFF.

```mermaid
flowchart LR
    IN[Face crop] --> SP[EfficientNet-B4 backbone]
    IN --> D[Block-DCT]
    D --> Z[Zero the low bands]
    Z --> IV[Inverse DCT<br/>high-pass residual image]
    IV --> MS[Multi-scale conv stream]
    MS --> RA[Residual-guided attention]
    SP --> GF[Gated fusion<br/>gate alpha = 0 at init]
    RA --> GF
    GF --> HD[Classifier head]
    HD --> OUT[prob_fake + Grad-CAM]
```


## Figure 2.9: Architecture of the B4-liveness baseline.

```mermaid
flowchart LR
    IN[Face crop] --> B4[EfficientNet-B4<br/>spatial features]
    B4 --> HD[Two-layer binary head]
    HD --> OUT[spoof probability<br/>live or spoof verdict]
```


## Figure 2.10: Architecture of the B4+DCT-liveness proposal.

```mermaid
flowchart LR
    IN[Face crop] --> SP[EfficientNet-B4]
    IN --> FQ[Block-DCT branch<br/>16 bands]
    SP --> GF[Gated cross-attention<br/>gate alpha = 0 at init]
    FQ --> GF
    GF --> HD[Binary head]
    HD --> OUT[spoof probability + verdict]
```


## Figure 3.24: Deployment of DeepGuard on a single cloud instance. A reverse proxy terminates HTTPS and forwards to the four containers on a private network; the backend reaches the database and the model service only over the internal network.

```mermaid
flowchart TB
user["End user, browser, over HTTPS"]
ext["External eKYC backend, with an API key"]
subgraph host["Cloud instance, processor-only inference"]
proxy["Reverse proxy with HTTPS"]
subgraph net["Docker, private network"]
fe["frontend"]
be["backend"]
sf["model service, the detector and the face detector"]
db[("database")]
end
end
user -->|HTTPS| proxy
ext -->|HTTPS| proxy
proxy --> fe
proxy --> be
fe -->|requests| be
be -->|database access| db
be -->|prediction request| sf
```
