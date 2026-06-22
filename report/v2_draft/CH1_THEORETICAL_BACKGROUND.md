# CHAPTER 1: THEORETICAL BACKGROUND

## 1.1 Overview of the Problem Domain

### 1.1.1 Data Characteristics

Each method for making a fake face leaves its own mark, and knowing how a fake is produced indicates where its trace appears and which view reveals it. This thesis works mostly with three families of face-forgery methods, listed in Table 1.1.

_Table 1.1: Families of face-forgery techniques._

| Family | How it works | Characteristic trace |
|---|---|---|
| Autoencoder face swap | A shared encoder with per-identity decoders swaps a face, which is then blended into the original frame | A blending boundary where two regions of differing statistics meet |
| Generative adversarial network [23] | A generator trained against a discriminator grows an image through repeated upsampling layers | Periodic upsampling patterns that surface as spectral peaks |
| Diffusion model | An image is reconstructed from pure noise in many small steps (used here only as a future direction) | Frequency statistics that still differ from natural photographs |

These methods leave the three kinds of marks listed in Table 1.2, all easier to see in the frequency view of an image than in its raw pixels. The frequency view describes a picture by how fast its brightness changes, separating slow, smooth areas from fine, rapid detail.

_Table 1.2: Forgery trace types and their frequency signatures._

| Trace type | Where it appears | Frequency signature |
|---|---|---|
| Blending boundary | The seam where a swapped region is composited into the host frame | Smoothing that hides the seam in pixels abnormally suppresses high-frequency energy around it |
| Upsampling artifact | The periodic pattern left by a generator's upsampling layers | Energy peaks in the middle and high bands of the spectrum |
| Frequency inconsistency | An image assembled from several sources or passed through a generative network | Breaks the single coherent frequency signature that a real camera imprints |

A network that looks only at pixels can find these clues only with difficulty, since each mark is small and hidden among ordinary detail. Moving the image into the frequency view sorts the same evidence into separate bands, so the marks stand out. For this reason the detector runs a frequency view alongside the pixel view.

### 1.1.2 Problem Definition

At the level of a single image, deepfake detection is a binary classification problem (a task with exactly two possible answers). Given a face image $x$, a model $f_\theta$ returns the probability that the image is fake, with a real face labelled $y=0$ and a fake one $y=1$. The output is a number between 0 and 1, so a cut-off $\tau$ is chosen and anything at or above it is called fake:

$$\hat{y}=f_\theta(x)\in[0,1],\quad \text{predict fake iff } \hat{y}\ge\tau \tag{1.1}$$

The model learns using binary cross-entropy and is judged mainly by the AUC [21], the area under the ROC curve, both defined in Section 1.3. The AUC is preferred over plain accuracy because it depends only on ranking fakes above reals, so it is insensitive to the cut-off $\tau$ and to the class imbalance common in deepfake datasets.

The real difficulty is holding up on a dataset other than the one trained on. A model that trains and tests on the same dataset usually scores very high, then falls off sharply on data from another source. The cause is shortcut learning: the model fastens onto an idiosyncrasy of the training fakes, such as an upsampling pattern at one exact frequency, that is absent from fakes made by a different tool. To generalise, a detector must be pushed toward marks not tied to any one tool, and the frequency view helps because its causes are universal: every generator must upsample, and every blend breaks the consistency of an image's frequencies. For this reason the evaluation trains on one dataset and tests on a completely different one.

### 1.1.3 Benchmark Datasets

The training set is FaceForensics++ [2], which collects four ways of forging a face, covering both swapping one person's identity onto another and copying one person's expressions onto another (Table 1.3). Mixing methods that learn from data with methods built from computer graphics forces a detector to find the marks shared across all of them rather than memorising one tool's quirk.

_Table 1.3: The four forgery methods in FaceForensics++._

| Method | Type | Mechanism | Characteristic trace |
|---|---|---|---|
| Deepfakes | identity swap | autoencoder swap, then blending | blending boundary, texture inconsistency |
| Face2Face | expression reenactment | 3D model based re-rendering | rendering errors around the modified region |
| FaceSwap | identity swap | graphics based swap using landmarks | geometric seams, lighting inconsistency |
| NeuralTextures | expression reenactment | learned textures, neural rendering | subtle artifacts around the mouth |

The test set is Celeb-DF-v2 [3], a high-quality collection whose fakes were polished to remove the obvious flaws of older datasets. Its method of making fakes is entirely unlike the training set, which makes it well suited to probing generalisation, and it is used only for testing. A further constraint arises from the eKYC setting: uploaded images are nearly always compressed, and compression removes part of the fine, high-frequency detail where forgery marks reside. The training data is therefore kept at a moderate level of compression on purpose, since a detector is only useful if it still works once that detail is partly gone.

_Table 1.4: The two datasets._

| Property | FaceForensics++ | Celeb-DF-v2 |
|---|---|---|
| Role | training | testing |
| Real videos | 1000 | 590 |
| Fake videos | 4000 | 5639 |
| Forgery methods | 4 | 1 |
| Frames per video | 32 | 32 |

Taking 32 frames from each video gives about 159600 frames on the training side and 16420 on the test side, of which Celeb-DF-v2 supplies 5620 real and 10800 fake frames. All training and evaluation run through DeepfakeBench [4], a public framework that fixes the preprocessing, the splits, and how each score is computed, so the numbers can be lined up directly against published figures. The thesis baseline closely matches the published backbone figure, which confirms the pipeline before any improvement is attempted. The full results, including the configurations that did not beat the baseline, are reported in Chapter 4.

## 1.2 Fundamental Deep Learning Techniques

This section describes the standard parts the detector is built from, the basic tools of modern computer vision, kept at a plain textbook level.

### 1.2.1 Convolutional Neural Networks

A convolutional neural network turns an image $x$ into a prediction by passing it through many layers of small learnable filters. The key operation is the **convolution**. A filter (or kernel) is a small grid of numbers, often $3\times3$, that slides across the image and at each position produces a weighted sum of the underlying patch (Figure 1.1). It scans for one local pattern, such as a short edge, and responds wherever it appears. Because the same filter is reused at every position, the network needs only a few numbers to scan the whole image, and a pattern is recognised regardless of where it sits.

![Figure 1.1: The convolution operation](figures/fig_1_convolution.png)

_Figure 1.1: The convolution operation: a kernel slides over the input and computes a weighted sum at each position. Source: Mittal [35]._

Two settings control how the filter moves. The stride is how far it moves between positions, so a stride of two halves the output's height and width. Padding adds a thin border of zeros so the output can retain the input's size when required.

After a convolution the network applies an activation, the usual choice being the rectified linear unit $\mathrm{ReLU}(z)=\max(0,z)$, which keeps positive values and zeros negatives. It is cheap and, for positive inputs, never flattens out, so the learning signal does not fade through the layers. A pooling layer then shrinks the picture by summarising each neighbourhood into one value, max pooling keeping the strongest response and average pooling the mean, which lowers the resolution and makes the network less sensitive to tiny shifts.

Stacking these layers builds a feature hierarchy: the first layers respond to simple structures such as edges, corners, and textures, layers further in combine those into larger shapes, and the deepest layers represent whole objects or task-level concepts.

Very deep stacks become hard to train, which the **residual connection** addresses by adding a layer's input directly to its output, so the layer learns only a small correction $\mathcal{F}(x)$, computing $x+\mathcal{F}(x)$ instead of rebuilding everything from scratch [33]. This skip connection lets information and the learning signal bypass the layer when it has nothing to add, keeping training stable even with hundreds of layers. The detector reuses this idea both inside its backbone and as the structural template for later fusion.

Beyond the ordinary convolution, two cheaper variants recur in efficient networks and matter for the rest of this thesis (Table 1.5).

_Table 1.5: Convolution variants used in the backbone._

| Variant | Operation | Role |
|---|---|---|
| Standard (dense) convolution | Mixes all input channels at every position | Expressive but the most costly |
| Depthwise convolution | One filter per channel, spatial only; with a pointwise step it forms the depthwise-separable convolution [29] | Cheap channel-wise spatial filtering |
| 1x1 (pointwise) convolution | Combines channels at each pixel with no spatial extent | Expanding or compressing the channel dimension |

### 1.2.2 Backbone Architectures

A backbone is the main feature-extracting network the rest of the system is built on. The spatial branch uses EfficientNet [1], whose idea starts from one observation: a convolutional network can be made bigger along three axes, depth (more layers), width (more channels per layer), and resolution (a larger input image), and growing all three together works better than pushing on one. Table 1.6 sets out what each provides and how it backfires if pushed too far.

EfficientNet therefore uses **compound scaling**, one rule that grows all three at once. A single knob $\phi$ sets the overall size and the rule turns it into matched amounts of each dimension:

$$\text{depth}=\alpha^{\phi},\ \text{width}=\beta^{\phi},\ \text{resolution}=\gamma^{\phi}\quad\text{s.t.}\quad \alpha\cdot\beta^{2}\cdot\gamma^{2}\approx 2,\ \alpha,\beta,\gamma\ge 1 \tag{1.2}$$

Here $\alpha$, $\beta$, and $\gamma$ are three balance constants found once by a quick search on the smallest model. After that, only $\phi$ is changed to scale the network evenly along all three dimensions, producing the family from B0 (smallest) to B7 (largest) [1].

_Table 1.6: Comparison of depth, width, and resolution._

| Dimension | Meaning | Benefit | Risk |
|---|---|---|---|
| Depth | number of layers | learns more abstract features | hard to train when too deep |
| Width | number of channels | learns more varied features | wastes parameters when too wide |
| Resolution | input image size | sees smaller details | computation grows quickly |

This thesis uses EfficientNet-B4, a middle member that balances accuracy and cost, for three reasons:

- First, B4 is the backbone used by the public benchmark adopted in this thesis [4], so it permits a direct and fair comparison with published baselines.
- Second, B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU with a reasonable batch size.
- Third, B4 was designed for inputs of roughly 380 pixels, so at the working size of 256 pixels it still retains enough detail to capture small artifacts.

The backbone is not trained from nothing. It is initialised with weights learned on ImageNet, a large general-purpose image dataset, then fine-tuned on the task, a reuse called transfer learning [1]. It works because the early layers of any vision network learn generic patterns (edges, corners, textures) useful whether the goal is naming objects or detecting fakes, so only the higher layers need retraining. In practice this requires less data, trains faster, and usually generalises better.

### 1.2.3 Model-Specific Components

EfficientNet is made by repeating one building block, the **MBConv block**, borrowed from MobileNetV2 [32], which learns rich features at low cost in three steps. First, expand: a $1\times1$ convolution raises the number of channels, for example six times, giving a wide workspace. Second, a depthwise convolution learns spatial patterns on each channel independently, where most of the saving comes from since it omits the expensive channel mixing. Third, project: another $1\times1$ convolution compresses the channels back down. When input and output shapes match, a residual shortcut is added [33]. Figure 1.2 shows this structure.

![Figure 1.2: The MBConv block](figures/fig_1_2_mbconv.png)

_Figure 1.2: The MBConv block._

Each block also has a squeeze-and-excitation module [24], premised on the fact that for a given image some channels carry useful signal and others mostly noise. It averages each channel, feeds those averages through a small two-layer network to obtain one importance score per channel, then amplifies high-scoring channels and attenuates the rest [24], so the block decides which feature maps matter from a simple per-channel average. Frequency-domain generalisations of this idea exist, such as FcaNet [5], which replaces the per-channel average with a small set of selected DCT components.

A more general way to let a model focus on what is relevant is **attention**. The scaled dot-product form measures how well each query in $Q$ matches each key in $K$, then uses those weights to blend the matching values $V$ into the answer [30]:

$$\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V \tag{1.3}$$

For each query, the most relevant entries are identified and their contents averaged by relevance, the division by $\sqrt{d_k}$ keeping the softmax from saturating. When $Q$, $K$, and $V$ share a source, the operation is self-attention. When the queries come from one source and the keys and values from another, it is cross-attention, which lets one representation draw in information from a second [30].

A further general mechanism is the gated residual. A sub-module's output is multiplied by a learnable number $\alpha$ starting at zero before it is added to the main path, so the sub-module initially contributes nothing and the network raises $\alpha$ during training to admit as much new signal as it finds helpful [31]. Starting from zero keeps early training stable and lets a freshly added branch enter gradually instead of disrupting a pretrained backbone.

The thesis combines these general components in a method-specific way: a cross-attention fusion in which the query is the spatial stream and the keys and values are the frequency stream, and an alpha-gate that injects frequency context as $x+\alpha\cdot\text{context}$.

## 1.3 Training and Evaluation Strategies

A detector is shaped by two choices: the goal it is trained toward and the standard by which it is judged. The first is a loss function, the formula that tells the network how wrong each prediction is. The second is a scoring metric that measures how cleanly the model separates real faces from fake ones, independent of the cut-off.

### 1.3.1 Loss Functions

The standard objective for this two-class problem is the **binary cross-entropy** (BCE) loss, which rewards predictions that are both correct and confident while penalising confident mistakes far more heavily than cautious ones (a real face called 90% fake costs much more than one called 55% fake).

$$\mathcal{L}_{\mathrm{BCE}}=-\frac{1}{N}\sum_{i=1}^{N}\big[y_i\log p_i+(1-y_i)\log(1-p_i)\big] \tag{1.4}$$

Here $p_i$ is the predicted fake probability for the $i$-th image in a batch of $N$, obtained by passing the network's raw output through a sigmoid into $[0,1]$. The label $y_i$ selects which term survives, so the loss stays small when a confident prediction is correct and grows rapidly as confidence points the wrong way. The whole detector, from the first convolutional layer to the real-or-fake head, is trained end-to-end under this single objective by gradient descent [27].

### 1.3.2 Evaluation Metrics

The main score is the **AUC**, the area under the ROC curve [21]. The ROC curve plots the true-positive rate (TPR, the share of fakes caught) against the false-positive rate (FPR, the share of real faces wrongly flagged) as the decision threshold sweeps across all values, and the AUC is the area under it, obtained by the trapezoidal rule over the curve's points:

$$\mathrm{AUC}=\sum_{i}\frac{TPR_i+TPR_{i-1}}{2}\,\big(FPR_i-FPR_{i-1}\big) \tag{1.5}$$

An AUC of 1.0 is a perfect ranking and 0.5 is no better than a random guess. Equivalently, the AUC is the probability that a randomly chosen fake scores higher than a randomly chosen real face, so it depends only on the ordering of the scores, not on the threshold $\tau$ or on the class balance [21]. Both properties matter for deepfake data, where the class mix is uneven and a threshold tuned on one dataset rarely carries over to another.

A second, related number is the **equal error rate** (EER), the common value of the false-positive and false-negative rates at the threshold where the two are equal. A lower EER means the real and fake score distributions overlap less. Where the AUC ignores the threshold entirely, the EER pins down a single representative threshold, so the two views complement each other.

All training and evaluation follow the DeepfakeBench protocol [4], which fixes the preprocessing, the data splits, and how each metric is computed, so the scores can be lined up directly against published numbers. The AUC is computed frame by frame, each sampled frame scored on its own and the metric taken over the whole pool. Plain accuracy is reported only as a secondary figure, since it forces a hard decision at one operating point and is easily skewed by class imbalance, so a model can show high accuracy while still ranking faces poorly.

The presentation-attack metrics APCER, BPCER, and ACER belong to the liveness task rather than to forgery classification, and they are defined in Section 1.4.2.

## 1.4 Frequency-Domain Analysis and Liveness

### 1.4.1 Frequency-Domain Analysis

A pixel grid stores an image as brightness values, one per dot, and a fake face can match those values almost perfectly, so the tampering is hard to see directly. The frequency domain offers a second view, asking not how bright each dot is but how fast the brightness changes, with smooth areas appearing as low frequencies and sharp edges or fine speckle as high frequencies. Many forgery traces are faint in the pixel grid but pronounced here, so the first design choice is which transform to use. This work adopts the **discrete cosine transform** (DCT) [10] rather than the discrete Fourier transform, for three reasons:

- The DCT produces real numbers only, so its output can be fed straight into a neural network without separating magnitude and phase.
- It compacts most of the signal energy into a small number of low-frequency coefficients, which leaves the high-frequency remainder, where many artifacts live, easier to isolate.
- And it is exactly the transform that JPEG applies to each non-overlapping 8x8 block [34], so a block-wise DCT is the natural lens for inspecting compression-related traces.

Take first the simplest case, a single row of numbers. For a discrete signal $x[n]$ with $n=0,\dots,N-1$, a list of $N$ values such as the brightness along one line of pixels, the one-dimensional DCT defines the $k$-th frequency coefficient as

$$X[k]=c(k)\sum_{n=0}^{N-1}x[n]\cos\!\left[\frac{\pi(2n+1)k}{2N}\right],\quad c(0)=\sqrt{\tfrac{1}{N}},\ c(k)=\sqrt{\tfrac{2}{N}}\ (k\ge1)\tag{1.6}$$

The cosine term is a wave whose oscillation speed is set by $k$, so each coefficient $X[k]$ measures how strongly the signal resembles the wave of frequency $k$: the first coefficient is proportional to the signal's average, and large-$k$ coefficients capture rapid variation such as edges and noise.

For a full grid the same idea is applied along rows and then columns. For an image block $B(i,j)$ of size $M\times N$, a small square patch indexed by row $i$ and column $j$, the two-dimensional DCT is

$$F(u,v)=c(u)c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1}B(i,j)\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right]\tag{1.7}$$

The output $F(u,v)$ is a grid the same size as the patch, where $u$ and $v$ denote horizontal and vertical frequency. The top-left corner holds the coarse, slowly changing content and frequency rises towards the bottom-right, with different corners holding different evidence (Table 1.7). A zigzag scan then traverses the grid diagonally from the top-left, sweeping the coefficients out roughly from low to high frequency, the same path JPEG follows before it compresses [34].

_Table 1.7: Regions of a 2D DCT coefficient block._

| Region | Frequency | Content | Artifact relevance |
|---|---|---|---|
| top left corner | zero (DC) | average brightness | little forgery signal |
| near top left | low | coarse shape | few artifacts |
| middle | mid | texture | upsampling and blending traces |
| bottom right | high | edges, noise | compression traces, inconsistency |

The mid and high bands are therefore where fake-face generation tends to leave a fingerprint, while the DC and low bands mostly carry ordinary content that genuine and manipulated faces share. The raw transform is not yet a feature a network can learn from. Several further steps shape it into one: applying the block-wise DCT to the face, grouping the zigzag coefficients into sixteen frequency bands, rescaling by log-magnitude so large and small values become comparable, gathering per-channel statistics in the YCbCr colour space, and optionally discarding the lowest bands. Those steps are part of the proposed method.

### 1.4.2 Liveness Detection

Deepfake detection asks whether a face was synthesised. Liveness detection asks whether the face in front of the camera is a real living person or merely a photo or screen held up to imitate one. In an eKYC pipeline the liveness check is the inexpensive first filter, and only a capture it judges to be live is passed to the heavier deepfake stage, so the crudest impersonation attempts are rejected before any frequency analysis is spent on them.

The fake inputs a liveness module must reject are called **presentation attacks**, something fake presented to the camera in place of a live face. They fall into a few recognised classes:

- A print attack shows a photograph of the target printed on paper.
- A replay attack plays a recorded video of the target on a screen held in front of the camera.
- A mask attack presents a physical mask, from a cheap paper cut-out to a moulded silicone face.

These attacks vary in cost and in the tell-tale signs they leave behind.

Liveness systems work in one of two modes. A passive mode decides from a single still photo, searching for cues that a flat surface was rephotographed, such as paper texture, the moire pattern of a screen (the ripple visible when a camera photographs another screen), or an incorrect reflection [26]. An active mode instead gives the user a task, such as blinking, turning the head, or reading a phrase aloud, then checks the response against what a live person would produce. Passive checks are effortless for the user but easier to deceive, active checks the reverse.

Liveness is a binary decision on an input actively trying to deceive it, so it is scored with the presentation-attack-detection metrics of ISO/IEC 30107-3 [13]. The **Attack Presentation Classification Error Rate** (APCER) is the share of attacks accepted as genuine, a measure of security. The Bona-fide Presentation Classification Error Rate (BPCER) is the share of real people wrongly rejected, a measure of the friction added for genuine users. The Average Classification Error Rate averages the two,

$$\mathrm{ACER}=\frac{\mathrm{APCER}+\mathrm{BPCER}}{2}$$

and gives one number weighing letting attacks in against shutting real users out. The liveness models built and compared in this thesis, the datasets used, and their measured APCER, BPCER, and ACER are reported in the experimental work that follows.

## 1.5 Web Technologies for the System

To be useful for eKYC the detector must reside inside a service that runs over the internet, one that checks who is calling, validates the input, saves a record, and returns an answer. This section walks through the web technologies that carry a request from a user's browser or a bank's software to the model and back. These are supporting tools, not the scientific contribution of the thesis, so the explanation is kept short.

### 1.5.1 Backend Technologies

The backend runs on the server, out of the user's sight. It is built with **FastAPI**, a Python framework for building web APIs (an API being the set of entry points other programs use to reach the service), which validates incoming data and generates interactive documentation automatically [27]. The backend is the single guarded entry point of the platform, the only component allowed to reach the database and the detection model. When a request arrives it checks the caller's token, validates the data, saves a record, passes the face image to the model service, and returns the result. The model runs in a separate program, so the entry point stays lightweight, and the generated documentation doubles as the guide external developers follow.

The backend and its callers communicate over HTTP, organised by RESTful (Representational State Transfer) principles. Each entity, such as a user, an API key, or a detection result, has its own URL and is acted on with a small fixed set of verbs: GET to read, POST to create, PUT or PATCH to change, DELETE to remove. Each request has four parts: the URL identifying the entity, the method specifying the action, headers carrying extra information such as the login token and data format, and a body carrying the data, usually as JSON. A response mirrors this with a status code (200 success, 404 not found), headers, and a body. Any program that can speak HTTP can call the service, so the frontend and backend teams can work independently.

![Figure 1.3: REST API architecture](figures/fig_1_rest_api.png)

_Figure 1.3: REST API architecture: client request (URL, method, headers, body) and server response (status, headers, body) over HTTP._

For real use, the same service runs on Amazon Web Services (AWS), a cloud platform that rents out computers and storage. A single EC2 instance, one rented virtual machine, hosts the frontend, backend, model service, and database together. Because the model runs on the ordinary processor rather than a graphics card, the machine is chosen for ample memory rather than graphics power. Around it sit a few AWS services, each with one clear function:

- S3 stores uploaded media, saved model files, and exported audit files as objects in cloud storage.
- ACM provides the certificate that turns on HTTPS, the encrypted form of web traffic, for the public domain, so data to and from browsers travels scrambled.
- CloudWatch gathers the backend's logs, watches the error rate, and raises an alert when something looks wrong.
- An Elastic IP pins a fixed public address to the machine, so the service keeps the same address after a restart. This is the address the domain name points to.

### 1.5.2 Frontend Technologies

The frontend is the dashboard the operator views in the browser. It is written in TypeScript, a stricter JavaScript whose type checking catches many mistakes before the page runs. The dashboard is built with React and the **Next.js** framework: React builds a screen from small pieces, and Next.js wraps it with the infrastructure a real application needs, deciding which screen to show, how to render it, and how to package it for deployment. Three properties matter for a dashboard with many screens:

- The interface is component-based, assembled from small reusable parts.
- Routing follows the file system, so each screen is a folder in the source and a new screen is added by adding a folder.
- Rendering can happen on the server for a fast first load while interactive parts stay on the client, and React re-renders only the parts whose data changed.

The result is a dashboard that feels fast and stays easy to extend.

### 1.5.3 Domain Name System

The Domain Name System (DNS) is the internet's address book, turning a readable name such as `deepguard.vn` into the IP address computers use to locate each other. A domain name is purchased from a registrar, a company licensed to sell them, and its DNS records determine where traffic goes, an A record for example tying a name to one IP address. Authoritative servers hold the official records, while recursive resolvers look them up on a user's behalf and cache the answer so the next lookup is faster. In the deployed system DNS points the public domain at the cloud machine, directs each request to the correct destination, enables the HTTPS certificate to work, and keeps the public address steady. It is the first link in the chain that carries a request from the user's browser to the backend.

## 1.6 Conclusion

This chapter set out the ideas the rest of the thesis depends on. Deepfake detection is a binary classification problem whose real difficulty is generalisation, since a detector must catch manipulation styles it never saw in training. The traces a forgery leaves are often faint in the pixel domain but clear in the middle and high frequency bands, which is why this work reads an image both spatially and in the frequency domain. The chapter reviewed the building blocks that make this possible, namely a convolutional backbone such as EfficientNet-B4, the discrete cosine transform, attention as a way to combine two streams, and the zero-initialised gate, together with the metrics that judge a detector and the web technologies that turn it into a service. The next chapter combines these pieces into the proposed method.
