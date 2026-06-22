…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

*Da Nang, date month year 2026*

> **Instructor**

REVIEWER’S COMMENTS

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

…………………………………………………………………………………………

*Da Nang, date month year 2026*

> **Reviewer**

# SUMMARY

Topic title: Hybrid spatial-frequency learning with block-wise DCT for deepfake detection in eKYC

Student name: Le Ngoc Thanh

Student ID: 102220041 Class: 22T\_KHDL

Electronic Know Your Customer (eKYC) has become a routine part of banking and finance in Vietnam, where a customer can open an account or confirm a payment using only a portrait photo and a few taps on a phone. This convenience also opens two attack surfaces: deepfakes, in which generative models swap or synthesise a face, and presentation attacks, in which a printed photo or a screen replay is shown to the camera. This thesis builds a face-verification protection system, DeepGuard, that addresses both threats and packages them into a web demo.

The system is organised as a three-stage pipeline. The first stage is deepfake detection. The baseline is an EfficientNet-B4 spatial classifier. On top of it the thesis proposes SFDCT, which adds a block-wise discrete cosine transform branch and injects the frequency information through a zero-initialised gated cross-attention, so the frequency path is added on top of the backbone rather than replacing it. An improved variant, SFDCT-HFF, keeps the high-frequency residual of the transform as a high-pass image before fusion. The second stage is liveness detection, which uses facial-behaviour cues, namely the eye-aspect ratio and head pose from MediaPipe FaceMesh, and runs first in the cascade as a cheap pre-filter. The third stage is face matching with ArcFace.

Evaluation follows a cross-dataset protocol: the deepfake models are trained on FaceForensics++ and tested on Celeb-DF-v2, which the model never sees during training. The three configurations reach a video-level AUC of about 0.82 for the baseline, 0.81 for SFDCT and 0.83 for SFDCT-HFF. These results are single-seed, and the paired bootstrap confidence intervals contain zero, so the differences are not statistically significant and the method is not state of the art. The liveness head reaches an AUC of 0.98 with an ACER of 6.85%.

<table>
<tbody>
<tr class="odd">
<td><p>DA NANG UNIVERSITY</p>
<p><strong>UNIVERSITY OF SCIENCE AND TECHNOLOGY</strong></p>
<p>FACULTY OF INFORMATION TECHNOLOGY</p></td>
<td><p><strong>THE SOCIALIST REPUBLIC OF VIETNAM</strong></p>
<p>Independence - Freedom - Happiness</p></td>
</tr>
</tbody>
</table>

**GRADUATION PROJECT REQUIREMENTS**

Student Name: Le Ngoc Thanh

Student ID :102220041

Class: 22T\_KHDL Faculty: Information Technology

Major: Data Science and Artificial Intelligent

1.  *Topic title:* Hybrid spatial-frequency learning with block-wise DCT for deepfake detection in eKYC

2.  *Project topic :* ☐*has signed intellectual property agreement for final result*

3.  *Initial figure and data:*

No data

*Content of the explanations and calculations:*

The content of the thesis includes:

> **INTRODUCTION** - This chapter gives information about the context and purpose of the project as well as giving the scope of the problems which will be focused on the thesis.
> 
> **Chapter 1:** THEORIES AND TECHNOLOGIES - This chapter introduces the core theories and technologies used in the project, including the web stack, deep learning fundamentals, frequency analysis, and an overview of deepfake generation and detection.
> 
> **Chapter 2:** ANALYSIS AND DESIGN - This chapter describes the system’s key features, functional requirements, and architectural design combining software components and AI-based processing.
> 
> **Chapter 3:** IMPLEMENTATION AND EVALUATION - This chapter details the implementation of the system and its AI components, along with experimental results and performance evaluation.
> 
> **CONCLUSION** - The concluding section of the project simultaneously emphasizes the problem solved, as well as presenting issues still unresolved and provides recommendations and suggestions.

4.  *Drawings, charts (specify the types and sizes of drawings):*

<!-- end list -->

  - > Use case diagram

<!-- end list -->

  - > Activity diagram

<!-- end list -->

  - > Sequence diagram

<!-- end list -->

5.  *Name of instructor:*

6.  *Date of assignment : ……../……./2026*

7.  *Date of completion : ……../……./2026*

|                              | *Đà Nẵng, date month year 2026* |
| ---------------------------- | ------------------------------- |
| **Head of Division**…………………. | **Instructor**                  |

# PREFACE

After more than two months of dedicated effort, my thesis project has finally reached its completion. This period has been both challenging and rewarding, providing me with valuable knowledge, practical experience, and opportunities for personal development. As I reflect on this journey, I would like to express my sincere appreciation to everyone who has supported and encouraged me along the way.

First of all, I would like to express my deepest gratitude to my instructor, Assoc. Prof. Dr. Pham Cong Thang, for his guidance and support during the development of this thesis. Despite his busy schedule, he always took the time to review my work, provide useful feedback, and answer my questions. His advice and encouragement helped me improve my research and stay focused on my goals. I am truly grateful for his patience and dedication throughout the project.

I would also like to thank my family and friends for their constant support and encouragement. They always believed in me and motivated me whenever I faced difficulties. Their understanding and care gave me the confidence to continue working hard and complete this thesis successfully.

Finally, I would like to thank everyone who contributed to this project in different ways. Without your support, this achievement would not have been possible.

Thank you for being a part of this meaningful journey.

> Sincerely,
> 
> Le Ngoc Thanh

# ASSURRANCE

I guarantee:

The content of this senior project has been carried out by myself under the guidance and supervision of Assoc. Prof. Dr. Pham Cong Thang.

All references, documents, and materials used in this thesis have been clearly cited with the authors' names, publication titles, and sources. I have tried our best to ensure that all information is presented accurately and honestly.

I take full responsibility for any violations of academic regulations, including plagiarism, copyright infringement, or any other form of academic misconduct related to this thesis.

Student Performed

> Le Ngoc Thanh

# TABLE OF CONTENT

*{Để 2 dòng trống tại đây}*

*{Font: Time New Roman; thường; cỡ chữ: 13; dãn dòng: 1,3; căn lề: justified}{In trên 2 mặt giấy từ trang này đến hết phần “PHỤ LỤC”}*

Summary

Thesis mission

Preface and Acknowledgement i

Assurance ii

Table of contents iii

List of table, drawing, diagram v

List of acronyms vi

Trang

**Chapter 1 ...................................................**

**1.1 ................................................................** 1

1.1.1

1.1.2

**1.2** 7

1.2.1

1.2.2….................................

**1.3 ........................................** 22

**Chapter 2 .......................................................**

**2.1**…..

2.1.1….

2.1.2…..

**2.2**

…..

**Chapter 3** 50

**3.1**…..

3.1.1….

3.1.2….

**3.2** ………………

**CONCLUSION** 68

**REFERENCES** 70

**APPENDIX**

[**SUMMARY 3**](#summary)

[**PREFACE 1**](#preface)

[**ASSURRANCE 2**](#assurrance)

[**TABLE OF CONTENT 3**](#table-of-content)

[**LIST OF TABLES, PICTURES 7**](#list-of-tables-pictures)

[**LIST OF SYMBOL, ACRONYM 8**](#list-of-symbol-acronym)

[**INTRODUCTION 11**](#introduction)

[1. Problem Statement 11](#)

[2. Purposes 11](#)

[3. Objectives 12](#)

[4. Implementation process 13](#)

[5. Structure of the thesis 14](#)

[**Chapter 1: THEORIES AND TECHNOLOGIES 15**](#chapter-1-theories-and-technologies)

[1.1. JavaScript 15](#javascript)

[1.2. Next.js 15](#next.js)

[1.2.1. Key features 15](#key-features)

[1.2.2. Advantages 16](#advantages)

[1.3. FastAPI 16](#fastapi)

[1.4. HTTP API 16](#http-api)

[1.5. Domain Name System (DNS) 17](#domain-name-system-dns)

[1.6. EfficientNet-B4 18](#efficientnet-b4)

[1.6.1. The role of the spatial backbone 18](#the-role-of-the-spatial-backbone)

[1.6.2. Compound scaling 18](#compound-scaling)

[1.6.3. The MBConv block 19](#the-mbconv-block)

[1.6.4. Reasons for choosing B4 and transfer learning 20](#reasons-for-choosing-b4-and-transfer-learning)

[1.7. The Discrete Cosine Transform and Frequency Analysis 20](#the-discrete-cosine-transform-and-frequency-analysis)

[1.7.1. The choice of the DCT 20](#the-choice-of-the-dct)

[1.7.2. One-dimensional and two-dimensional DCT 21](#one-dimensional-and-two-dimensional-dct)

[1.7.3. The frequency feature chain 21](#the-frequency-feature-chain)

[1.8. Attention Mechanisms and Feature Fusion 22](#attention-mechanisms-and-feature-fusion)

[1.8.1. The fusion problem 22](#the-fusion-problem)

[1.8.2. Self-attention and cross-attention 22](#self-attention-and-cross-attention)

[1.8.3. The gate coefficient 23](#the-gate-coefficient)

[1.8.4. Zero initialisation and the performance floor 23](#zero-initialisation-and-the-performance-floor)

[1.9. Overview of Deepfake Technology 24](#overview-of-deepfake-technology)

[1.9.1. The link between generation and detection 24](#the-link-between-generation-and-detection)

[1.9.2. Three families of face forgery techniques 24](#three-families-of-face-forgery-techniques)

[1.9.3. The four forgery methods in the training dataset 24](#the-four-forgery-methods-in-the-training-dataset)

[1.9.4. Forgery traces in the spatial and frequency domains 25](#forgery-traces-in-the-spatial-and-frequency-domains)

[1.10. The Detection Problem and the Generalisation Challenge 26](#the-detection-problem-and-the-generalisation-challenge)

[1.10.1. The binary classification problem 26](#the-binary-classification-problem)

[1.10.2. The generalisation gap 26](#the-generalisation-gap)

[1.10.3. Datasets and the evaluation protocol 26](#datasets-and-the-evaluation-protocol)

[1.11. The Detection Problem and the Generalisation Challenge 28](#the-detection-problem-and-the-generalisation-challenge-1)

[1.11.1. The role of eKYC against deepfakes 28](#the-role-of-ekyc-against-deepfakes)

[1.11.2. Circular 17/2024/TT-NHNN and the chosen operating point 28](#circular-172024tt-nhnn-and-the-chosen-operating-point)

[1.11.3. The need for explainability 28](#the-need-for-explainability)

[1.12. Liveness Detection Theory 28](#liveness-detection-theory)

[1.12.1. The role of liveness in eKYC 28](#the-role-of-liveness-in-ekyc)

[1.12.2. Types of presentation attack 28](#types-of-presentation-attack)

[1.12.3. Passive and active liveness 28](#passive-and-active-liveness)

[1.13. Amazon Web Services 28](#amazon-web-services)

[1.14. Conclusion 29](#conclusion)

[**Chapter 2: SYSTEM ANALYSIS AND DESIGN 30**](#chapter-2-system-analysis-and-design)

[2.1. Requirement analysis 30](#requirement-analysis)

[2.1.1. Functional requirements 30](#functional-requirements)

[2.1.2. Non-functional requirements 30](#non-functional-requirements)

[2.2. System design 31](#system-design)

[2.2.4. Activity diagram 37](#activity-diagram)

[2.2.5. Sequence diagrams 38](#sequence-diagrams)

[2.3. Method - Deepfake Detection 40](#method---deepfake-detection)

[2.4. Method - Liveness Detection 49](#method---liveness-detection)

[2.4.2. Evaluation method and loss function 51](#evaluation-method-and-loss-function)

[2.4.3. B4-liveness architecture (baseline) 51](#b4-liveness-architecture-baseline)

[2.4.4. B4+DCT-liveness architecture (proposal) 52](#b4dct-liveness-architecture-proposal)

[2.5. Conclusion 52](#conclusion-1)

[**Chapter 3: SYSTEM IMPLEMENTATION AND EVALUATION 54**](#chapter-3-system-implementation-and-evaluation)

[3.1. Experimental Results 54](#experimental-results)

[3.1.1. Overview of the deepfake task - data and environment 54](#overview-of-the-deepfake-task---data-and-environment)

[3.1.2. EfficientNet-B4 baseline - design and training 57](#efficientnet-b4-baseline---design-and-training)

[3.1.3. SFDCT - design and training 57](#sfdct---design-and-training)

[3.1.4. SFDCT-HFF - design and training 58](#sfdct-hff---design-and-training)

[3.1.5. Comparative evaluation 59](#comparative-evaluation)

[3.1.6. Decision threshold for the eKYC operating point 62](#decision-threshold-for-the-ekyc-operating-point)

[3.1.7. Discussion of the deepfake task 63](#discussion-of-the-deepfake-task)

[3.1.8. Conclusion of the deepfake task 65](#conclusion-of-the-deepfake-task)

[3.1.9. The liveness task (secondary) 65](#the-liveness-task-secondary)

[3.2. Implementing the system 68](#implementing-the-system)

[3.2.1. Technology stack 69](#technology-stack)

[3.2.2. Deployment environment 70](#deployment-environment)

[3.2.3. Domain registration and DNS 71](#domain-registration-and-dns)

[3.2.4. System access 72](#system-access)

[3.3. Results (application screens) 73](#results-application-screens)

[3.3.1. Home screen 73](#home-screen)

[3.3.2. Deepfake-detection screen 73](#deepfake-detection-screen)

[3.3.3. Liveness screen 74](#liveness-screen)

[3.4. Conclusion 74](#conclusion-2)

[**CONCLUSION 75**](#conclusion-3)

[**REFERENCES 77**](#references)

# LIST OF TABLES, PICTURES

TABLE 1.1 {size 13}.........................................................................................................

TABLE 1.2 ……................................................................................................................

TABLE 1.3 ……................................................................................................................

…….……..........................................................................................................................

PICTURE 1.1 ...................................................................................................................

PICTURE 1.2 ....................................................................................................................

PICTURE 1.3 ....................................................................................................................

…….……..........................................................................................................................

***Ghi chú:***

  - > Mỗi table, hình vẽ/ sơ đồ phải được đánh số và có tên;

  - > Đánh số table và đánh số hình vẽ/ sơ đồ riêng. Quy luật đánh số như sau:
    
      - > Chữ số thứ nhất chỉ tên chương;
    
      - > Chữ số thứ hai chỉ thứ tự table biểu, sơ đồ, hình,…trong mỗi chương.

# LIST OF SYMBOL, ACRONYM

| No. | Item     | Description                                                                                |
| --- | -------- | ------------------------------------------------------------------------------------------ |
| 1   | AI       | Artificial Intelligence                                                                    |
| 2   | AP       | Average Precision                                                                          |
| 3   | AUC      | Area Under the (ROC) Curve                                                                 |
| 4   | ACER     | Average Classification Error Rate                                                          |
| 5   | APCER    | Attack Presentation Classification Error Rate                                              |
| 6   | BPCER    | Bona-fide Presentation Classification Error Rate                                           |
| 7   | CDFv2    | Celeb-DF-v2                                                                                |
| 8   | CNN      | Convolutional Neural Network                                                               |
| 9   | DC       | Direct Current (coefficient)                                                               |
| 10  | DCT      | Discrete Cosine Transform                                                                  |
| 11  | DFDC     | DeepFake Detection Challenge (dataset)                                                     |
| 12  | DNS      | Domain Name System                                                                         |
| 13  | eKYC     | electronic Know Your Customer                                                              |
| 14  | EER      | Equal Error Rate                                                                           |
| 15  | FAD      | Frequency-Aware Decomposition                                                              |
| 16  | FAS      | Face Anti-Spoofing                                                                         |
| 17  | FcaNet   | Frequency Channel Attention Network                                                        |
| 18  | FDFL     | Frequency-aware Discriminative Feature Learning                                            |
| 19  | FF++     | FaceForensics++                                                                            |
| 20  | FLOPs    | Floating Point Operations                                                                  |
| 21  | FPR      | False Positive Rate                                                                        |
| 22  | FPS      | Frames Per Second                                                                          |
| 23  | GAN      | Generative Adversarial Network                                                             |
| 24  | Grad-CAM | Gradient-weighted Class Activation Mapping                                                 |
| 25  | ImageNet | ImageNet (dataset)                                                                         |
| 26  | ISO/IEC  | International Organization for Standardization / International Electrotechnical Commission |
| 27  | KL       | Kullback–Leibler (divergence)                                                              |
| 28  | MSE      | Mean Squared Error                                                                         |
| 29  | PAD      | Presentation Attack Detection                                                              |
| 30  | PR       | Precision–Recall (curve)                                                                   |
| 31  | ROC      | Receiver Operating Characteristic                                                          |
| 32  | RNN      | Recurrent Neural Network                                                                   |
| 33  | SBI      | Self-Blended Images                                                                        |
| 34  | SFDCT    | Spatial–Frequency with block-wise DCT                                                      |
| 35  | SPSL     | Spatial-Phase Shallow Learning                                                             |
| 36  | SRM      | Steganalysis Rich Model                                                                    |
| 37  | t-SNE    | t-distributed Stochastic Neighbor Embedding                                                |
| 38  | TPR      | True Positive Rate                                                                         |
| 39  | TT-NHNN  | Circular – State Bank of Vietnam                                                           |
| 40  | XAI      | Explainable Artificial Intelligence                                                        |
| 41  | YCbCr    | Luma–Chroma color space                                                                    |

  - 
# INTRODUCTION

## Problem Statement

In recent years, electronic Know Your Customer (eKYC) has become a familiar part of banking and finance. A customer can open an account, take a loan, or confirm a payment from home, using only a portrait photo and a few taps on a phone. Thanks to this convenience, eKYC is now the first door into many financial services in Vietnam.

However, this door has also become a target for attack. The attacks come in two main forms. The first is the deepfake, where generative models are used to swap or create faces, so a fake face that looks real can be made quickly and at low cost. The second is the presentation attack, where a printed photo or a screen replay is placed in front of the camera to impersonate a real customer. If either attack passes the face verification step, the result can be identity fraud and real financial loss. In Vietnam, Circular 17/2024/TT-NHNN requires banks to verify customers with biometrics, but it does not state any exact error rate. At the same time, most current detectors learn directly from pixels: they work well on data similar to their training set, but often fail when facing a new forgery method or a new dataset. This generalisation problem is the hardest part of the task.

Recognizing this gap, this thesis aims to build a system that protects the face verification step from both kinds of attack. For deepfake detection, the model looks at a face image in two ways at the same time: the usual spatial view from pixels, and a frequency view computed on small image blocks, where deepfake traces are easier to see. For liveness detection, the system analyses facial behaviour cues such as eye state and head pose to recognize printed photos and screen replays. Both parts are wrapped in a web based demo, which also shows a heat map image to explain each decision.

This solution combines recent results in frequency analysis and deep learning, delivering a practical and explainable tool for the eKYC problem in Vietnam.

## Purposes

The purpose of this thesis is to build a face verification protection system that covers both deepfake detection and liveness detection. On the deepfake side, the goal is a detector that generalises better to forgery methods it has never seen, which is the realistic situation in practice, where attackers always use the newest tools. The main new point is the combination of a frequency branch, built on the discrete cosine transform of small image blocks, with a standard convolutional backbone through a gated attention mechanism. On the liveness side, the goal is a practical check based on facial behaviour, so simple presentation attacks can be filtered out early.

At the same time, the thesis tries to stay honest and practical. All models are trained and tested under the public DeepfakeBench protocol, so the comparison with the baseline is fair.

## Objectives

**Build a Functional Web Platform:** Develop a simple and intuitive interface that allows users to upload or capture a face image and receive the analysis results quickly.

**Deepfake Detection:** Apply deep learning and frequency analysis techniques to identify whether an uploaded face image is real or fake, together with a heat map image that explains each decision.

**Liveness detection:** Provide an additional utility to check whether the face in front of the camera is a live person or a printed photo and screen replay.

**Deploy the System to the Cloud:** Ensure that the platform is always available by deploying backend services using AWS EC2 and other cloud technologies.

The thesis works at frame level on single face images and does not use temporal information across video frames.

## Implementation process

**Step 1:** Idea Development and Requirements Definition

We defined the scope of the thesis: two protection layers, deepfake detection and liveness detection, with the eKYC scenario in Vietnamese banking as the target. The functional and non-functional requirements of the demo were also listed at this stage.

**Step 2:** Theory Research and Model Exploration

We studied how deepfakes are generated and why the generation process leaves traces in the frequency domain, then read the related works, chose a suitable convolutional backbone, and chose a public benchmark framework for training and evaluation.

**Step 3:** Data Preparation

Faces were extracted from the videos of two public datasets, aligned and cropped into face images of a fixed size, following the benchmark configuration.

**Step 4:** Model Building

The detection model was built: a frequency branch placed next to the spatial backbone, joined by a gated attention module that starts closed, so the frequency branch is added on top of the backbone.

**Step 5:** Training and Evaluation

The deepfake models were trained on one dataset and evaluated on another dataset that they had never seen. The liveness module was tested with common presentation attack cases. The details are given in Chapter 3.

**Step 6:** Demo Development and Cloud Deployment

A web demo was built with a modern frontend framework and a lightweight backend service, deployed on Amazon cloud infrastructure with storage and logging services, so the demo can be monitored in real time.

**Step 7:** Documentation

The final stage was writing this report, which presents the goals, the technical approach, the implementation, and the results of the thesis.

## Structure of the thesis

**INTRODUCTION -** This chapter gives information about the context and purpose of the thesis, as well as the scope of the problems which will be focused on in the thesis.

**Chapter 1: THEORIES AND TECHNOLOGIES -** This chapter introduces the core theories and technologies used in the thesis, including the web stack, deep learning fundamentals, frequency analysis, and an overview of deepfake generation and detection.

**Chapter 2: SYSTEM ANALYSIS AND DESIGN -** This chapter describes the system requirements, the design of the detection model, and the architectural design of the demo application.

**Chapter 3: IMPLEMENTATION AND EVALUATION -** This chapter details the implementation of the system, along with the experimental results and the performance evaluation.

**CONCLUSION -** The concluding section emphasizes the problems solved, presents the issues still unresolved, and provides recommendations and suggestions for future work.

**REFERENCES -** Presentation of the details of the referenced materials used in this thesis.

# Chapter 1: THEORIES AND TECHNOLOGIES

{Để 2 dòng trống}

## JavaScript

JavaScript is a high-level programming language widely used in web development. While HTML describes the structure of a page and CSS describes its appearance, JavaScript supplies its behaviour: it allows a page to react to clicks, validate forms, fetch data, and update the interface without reloading. It can also run on the server side through environments like Node.js.

In the DeepGuard system, JavaScript (written in its typed form, TypeScript) was mainly used to:

  - > Handle user interactions, such as uploading a face image and starting a detection request.

  - > Make API calls to the backend, with an authentication token attached to every request.

  - > Update the interface when the result returns, showing the risk score and the explanation heat map.

JavaScript works closely with HTML and CSS and, through the React library, it is the language in which the entire DeepGuard frontend is written.

## Next.js 

Next.js is a React framework for building user interfaces and single-page applications. The developer writes ordinary React components, and the framework provides the routing, rendering, and build tooling needed for a real application. In this project, Next.js is used together with React and TypeScript to build the dashboard of the system.

### Key features 

  - > Component-based architecture: the interface is assembled from small, reusable components.

  - > File-system routing: each screen of the dashboard is a folder in the source code, so a new screen is added simply by adding a folder.

  - > Server and client rendering: the page can be rendered on the server for a fast first load, while the interactive parts stay on the client.

  - > Efficient updates: React re-renders only the parts of the page whose data changed.
    
    1.  ### Advantages 

Next.js has a gentle learning curve on top of React, yet it can power a multi-screen dashboard. It is lightweight, performs well thanks to server rendering and efficient updates, and is supported by a large community with mature documentation. This keeps the frontend easy to maintain when new screens are added.

## FastAPI

FastAPI is a modern web framework for building APIs in Python, based on standard type hints. It offers high performance, built-in data validation, and automatic interactive documentation, and it is widely used for backend services and for serving machine learning models.

In DeepGuard, the backend is a FastAPI service that provides all the endpoints of the platform, from authentication and key management to detection and liveness. It is the only component allowed to reach the database and the detection model: it checks the token, validates the input, stores the record, forwards the face image to the model service, and returns the result. The model runs in a separate service, so the backend stays light. The automatically generated documentation is also used as the integration reference for external clients.

## HTTP API

An HTTP API (HyperText Transfer Protocol Application Programming Interface) is a standardized interface that allows different software systems to communicate with each other over the web using the HTTP protocol. It is one of the most common methods used in modern web development to enable the interaction between the client-side (frontend) and server-side (backend) of an application.

Figure 1.1: Rest API Architecture

**Structure of an HTTP API**

HTTP APIs are typically organized around RESTful principles (Representational State Transfer), where each resource (such as a user, an API key, or a detection result) is accessible through a specific URL (endpoint), and actions on those resources are performed using standard HTTP methods:

  - > GET: Retrieve data from the server

  - > POST: Send new data to the server

  - > PUT / PATCH: Update existing data

  - > DELETE: Remove data

**API Request:**

  - > URL: Identifies the resource

  - > Method: Specifies the operation (GET, POST, etc.)

  - > Headers: Additional metadata (e.g., authentication tokens, content type)

  - > Body: Contains data being sent to the server (usually in JSON format)

**API Response:**

  - > Status code: indicates the result of the request, for example 200 for success or 404 for not found

  - > Headers: information about the response

  - > Body: the actual data, usually in JSON format

**Benefits of using HTTP APIs:**

  - > Platform independence: any client, whether a browser, a mobile app, or another server, can communicate with the API over HTTP.

  - > Separation of concerns: frontend and backend development can proceed independently.

  - > Scalability: the API is easily extended as the application grows.

  - > Security: the API can be protected with authentication methods such as login tokens or API keys.

In DeepGuard, all communication follows this model: the dashboard calls the backend with a login token, while external banking systems call the detection endpoints directly with an API key, sending a face image and receiving a JSON result with the verdict, the probability score, and the explanation image.

## Domain Name System (DNS)

The Domain Name System (DNS) translates human-readable domain names, such as deepguard.vn, into the numerical IP addresses that computers use to find each other on the Internet. A domain is registered through a registrar, and DNS records determine how traffic for it is routed; for example, an A record maps a name to an IP address. Authoritative servers hold the actual records of a domain, while recursive resolvers look up records on behalf of clients and cache the results.

In DeepGuard, DNS maps the public domain to the address of the cloud server that hosts the system. This routes requests to the right host, enables secure HTTPS connections through certificates, and keeps the public address stable. It is the first link in the chain that carries a request from the user's browser to the backend.

2.  ## EfficientNet-B4
    
    1.  ### The role of the spatial backbone

Although the main idea of this thesis lies in the frequency domain, the detector still needs a strong spatial backbone, because many forgery traces are spatial by nature: inconsistent skin texture, errors around the eyes and teeth, and lighting that does not match between the face and the background. The frequency branch is designed to complement this spatial stream, not to replace it. The backbone therefore has to be both powerful and efficient. This thesis adopts EfficientNet-B4, a member of the EfficientNet family of convolutional networks, and this section explains what the model is and why it was chosen.

### Compound scaling

The idea behind EfficientNet \[1\] can be stated simply: when we want a convolutional network to be more accurate, there are three ways to make it bigger, and the best result comes from growing all three together rather than one at a time.

The three ways are depth (more layers, so the network can learn more abstract features), width (more channels per layer, so it can learn more varied features), and resolution (a larger input image, so it can see smaller details). Earlier designs usually grew only one of them; ResNet, for example, only went deeper. The problem is that each direction, grown alone, quickly hits a limit: a very deep network becomes hard to train, a very wide one wastes parameters, and a very large input makes computation explode.

Rather than scaling dimensions in isolation, EfficientNet employs a unified rule known as compound scaling. This approach adjusts depth, width, and resolution simultaneously based on a resource coefficient *ϕ*, ensuring that the architecture expands in a balanced and efficient manner. Under this framework, the scaling is defined by the following relations:

***depth=α*<sup>ϕ</sup>*, width=β*<sup>ϕ</sup>*, resolution=γ*<sup>ϕ</sup>,**

The scaling process is governed by the relation α⋅β2⋅γ2≈2, where α, β, and γ are specific constants determined through an initial search on the baseline model. Consequently, the user simply adjusts the resource parameter ϕ to ensure the architecture expands proportionally across all dimensions. By incrementally raising the value of ϕ, the family of models from B0 to B7 is generated; B4 represents an optimal midpoint in this series, effectively weighing predictive precision against computational requirements. The following table highlights the characteristics of these three scaling dimensions.

| **Dimension** | **Meaning**        | **Benefit**                   | **Risk**                        |
| ------------- | ------------------ | ----------------------------- | ------------------------------- |
| Depth         | number of layers   | learns more abstract features | hard to train when too deep     |
| Width         | number of channels | learns more varied features   | wastes parameters when too wide |
| Resolution    | input image size   | sees smaller details          | computation grows quickly       |

### 

### The MBConv block

EfficientNet is built by stacking one basic unit, the MBConv block, inherited from MobileNetV2. The goal of this block is to learn rich features at a low cost, and it does so in three steps:

  - > Expand: a 1x1 convolution raises the number of channels, for example six times, giving the block a wide space in which to compute features.

  - > Depthwise convolution: spatial patterns are learned on each channel separately. This is much cheaper than a normal convolution, which mixes all channels at once, and it is the step where most of the saving comes from.

  - > Project: another 1x1 convolution compresses the channels back to a small number, keeping only the useful information.

So the block briefly opens wide to compute, then closes down to store, which is why it learns well while staying small. A residual connection is added when the input and output sizes match, helping gradients flow during training.

Each block also contains a squeeze and excitation module \[24\]. Its idea is that not all channels are equally useful for a given image. The module computes the average value of each channel, passes these averages through a tiny network, and obtains one importance weight per channel; useful channels are then amplified and noisy ones are suppressed. This detail matters for this thesis: the importance weights here are computed from a simple average, and a later part of the proposed method extends exactly this mechanism, replacing the average with several frequency components so the attention can also listen to frequency information.

Figure 1.2: The MBConv block

### Reasons for choosing B4 and transfer learning

The choice of B4, rather than the smaller B0 or the larger B7, rests on three reasons. First, B4 is the backbone used by the public benchmark adopted in this thesis, so choosing it allows a direct and fair comparison with published baselines. Second, B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU with a reasonable batch size. Third, B4 was designed for inputs of around 380 pixels, so at the working size of 256 pixels it still retains enough detail to capture small artifacts.

The backbone is not trained from scratch. Instead, it is initialised with weights pretrained on ImageNet, a dataset of over a million natural images. The reasoning is that the early layers of any vision network learn generic patterns, such as edges, corners, and textures, and these patterns are the same whether the task is object recognition or forgery detection. By reusing them, only the higher layers need fine-tuning for the new task, which saves data, shortens training time, and usually improves generalisation. In summary, EfficientNet-B4 gives the detector a strong, efficient, pretrained spatial base to which the frequency branch is attached.

1.  ## The Discrete Cosine Transform and Frequency Analysis
    
    1.  ### The choice of the DCT

Section 1.9 will show that forgery artifacts are revealed clearly in the frequency domain, so the first design decision is which transform moves an image into that domain. This thesis chooses the discrete cosine transform (DCT) \[10\] over the Fourier transform for three reasons: the DCT produces real numbers only, so its output can be fed directly into a neural network; it concentrates most of the signal energy into a few low frequency coefficients, so the high frequency remainder, where the artifacts live, stands out; and it is exactly the transform that JPEG applies to each 8x8 block, making block-wise DCT the natural way to inspect compression related traces.

### One-dimensional and two-dimensional DCT

For a discrete signal x\[n\] with $n = 0,\\dots,N-1$, the DCT defines the $k$-th frequency coefficient as

\(X\left\lbrack k \right\rbrack = c\left( k \right)x\left\lbrack n \right\rbrack\cos\left\lbrack \frac{\pi\left( 2n + 1 \right)k}{2N} \right\rbrack,\quad k = 0,\ldots,N - 1\)

with $c(0) = \\sqrt{1/N}$ and $c(k) = \\sqrt{2/N}$ for $k \\ge 1$. Each coefficient measures how similar the signal is to a cosine wave of frequency $k$: the first coefficient is proportional to the average of the signal, while large-$k$ coefficients capture rapid variation such as edges and noise.

For an image block B(i,j) of size M x N, the two-dimensional DCT applies the same idea along rows and then columns:

\(F\left( u,v \right) = c\left( u \right)c\left( v \right)B\left( i,j \right)\cos\left\lbrack \frac{\pi\left( 2i + 1 \right)u}{2M} \right\rbrack\cos\left\lbrack \frac{\pi\left( 2j + 1 \right)v}{2N} \right\rbrack\)

The result is a grid of coefficients: the top left corner carries the coarse content, and frequencies increase towards the bottom right

Table 1.3: Regions of a 2D DCT coefficient block.

| **Region**      | **Frequency** | **Content**        | **Artifact relevance**            |
| --------------- | ------------- | ------------------ | --------------------------------- |
| top left corner | zero (DC)     | average brightness | little forgery signal             |
| near top left   | low           | coarse shape       | few artifacts                     |
| middle          | mid           | texture            | upsampling and blending traces    |
| bottom right    | high          | edges, noise       | compression traces, inconsistency |

### 

### The frequency feature chain

The frequency branch transforms the image through a chain of steps, each solving one problem.

Block-wise DCT on 8x8 blocks. A DCT over the whole image would mix global content and hide local artifacts. The image is instead divided into non-overlapping 8x8 blocks, each transformed independently, exactly as JPEG does. Artifacts stay localised to the few blocks around them, and the grid matches the JPEG grid.

Zigzag scan and 16 bands. Each block yields 64 coefficients, too many noisy dimensions to use individually. A zigzag path from the top left corner to the bottom right arranges them in order of increasing frequency, and they are grouped into 16 bands with one statistic per band, giving a compact and stable feature. The lowest bands, which mainly carry image content, can optionally be dropped so the model learns forgery traces rather than content.

Log-magnitude. The first coefficient can be thousands of times larger than a high frequency one, so raw values would numerically drown the small coefficients where the artifacts are. The transform

\(D\left( u,v \right) = log\left( 1 + \left| F\left( u,v \right) \right| \right)\)

compresses this range while avoiding the logarithm of zero.

Colour space. The DCT is applied on YCbCr rather than RGB: most frequency traces reside in the brightness channel Y, while JPEG compresses the colour channels Cb and Cr more heavily, so their statistics add complementary compression information.

Figure 1.3: Zigzag scan and the 16 frequency bands

This chain turns a face image into a frequency representation that is compact, localised, and normalised, in which the traces of Section 1.9 become patterns a small branch can learn.

2.  ## Attention Mechanisms and Feature Fusion
    
    1.  ### The fusion problem

The detector now has two streams: spatial features from the backbone and frequency features from the DCT branch. Simply concatenating them has two drawbacks: the model cannot decide when and where the frequency information should be trusted, and the fused model is no longer guaranteed to be at least as good as the backbone alone. Attention solves both by letting the spatial features selectively query the frequency features.

### Self-attention and cross-attention

In self-attention, each position produces a query Q, a key K, and a value V, and gathers information from all positions through

\(\text{Attention}\left( Q,K,V \right) = softmax\left( \frac{QK^{\top}}{} \right)V\)

The similarity between a query and the keys gives a set of weights, and the output is the weighted average of the values, with $\\sqrt{d\_k}$ keeping the weights from saturating.

Cross-attention is the variant where the query comes from one source and the keys and values from another, which is exactly what fusion needs. Here the query comes from the spatial features and the keys and values from the frequency features: each spatial position asks which frequency traces are relevant in its region and retrieves a weighted summary of them (Table 1.5).

*Table 1.5: Roles in the cross-attention fusion.*

| **Component** | **Source**       | **Role**                                |
| ------------- | ---------------- | --------------------------------------- |
| query         | spatial branch   | what this region needs                  |
| key           | frequency branch | what each feature describes             |
| value         | frequency branch | the information retrieved               |
| context       | combination      | answer injected into the spatial stream |

### 

### The gate coefficient

The frequency context is injected through a gate with a learnable coefficient \(\alpha\):

\(\text{feature}_{\text{fused}} = x + \alpha \cdot \text{context}\)

where \(x\) is the spatial feature. The coefficient acts as a volume control: if the frequency information reduces the training loss, the gradient opens the gate; if it is noisy or useless, \(\alpha\) is driven towards zero. The learned value is therefore also a measurement of how much the frequency branch contributes, reported in Chapter 3.

### Zero initialisation and the performance floor

The gate is initialised at \(\alpha\) = 0, so at the start of training the fused feature equals \(x\) and the model is exactly the pretrained backbone. The gate then opens only if the frequency information genuinely helps. This gives a guaranteed floor: in the worst case the gate stays near zero and the model is never worse than the backbone alone, a property that matters in eKYC where reliability comes first. By contrast, a related published model initialises its gate at 0.5 and carries no such guarantee; the comparison is detailed in later chapters.

Figure 1.4: Gated cross-attention fusion with the zero-initialised gate

3.  ## Overview of Deepfake Technology
    
    1.  ### The link between generation and detection

Every generation method leaves a fingerprint characteristic of its pipeline, so understanding how fakes are made tells us where to look for traces and in which domain they are most visible. This thesis builds on the point that some traces are nearly invisible in pixels yet clear in the middle and high frequency bands.

### Three families of face forgery techniques

Autoencoder face swap. Two autoencoders share one encoder but keep separate decoders for two identities; the encoder learns shared features such as pose and lighting. A face of person A is encoded and decoded by the decoder of person B, producing B's face with A's pose. The result is always blended back into the original frame, creating a boundary between two regions with different statistics.

Generative adversarial networks \[23\]. A generator learns to produce fakes while a discriminator learns to detect them, and the two are trained against each other. The key point for this thesis is the upsampling path: the generator grows a high resolution image from a small tensor through repeated upsampling layers, which leave periodic patterns visible as abnormal peaks in the spectrum.

Diffusion models. The newest family reconstructs an image from pure noise step by step. Quality is very high, but the frequency statistics still differ from natural photographs. Diffusion is noted here as a future direction; the training data of this thesis belongs to the first two families.

### The four forgery methods in the training dataset

The training dataset, FaceForensics++ \[2\], gathers four forgery methods covering identity swap and expression reenactment (Table 1.6). The mix of learning based and graphics based methods forces the detector to learn common traces rather than memorising one artifact type.

*Table 1.6: The four forgery methods in FaceForensics++.*

| **Method**     | **Type**               | **Mechanism**                       | **Characteristic trace**                    |
| -------------- | ---------------------- | ----------------------------------- | ------------------------------------------- |
| Deepfakes      | identity swap          | autoencoder swap, then blending     | blending boundary, texture inconsistency    |
| Face2Face      | expression reenactment | 3D model based re-rendering         | rendering errors around the modified region |
| FaceSwap       | identity swap          | graphics based swap using landmarks | geometric seams, lighting inconsistency     |
| NeuralTextures | expression reenactment | learned textures, neural rendering  | subtle artifacts around the mouth           |

### Forgery traces in the spatial and frequency domains

Three trace types matter most.

Blending boundary. Blending forces two regions with different sharpness, noise, and colour statistics to meet. Smoothing hides the boundary in pixels, but it also abnormally suppresses the high frequency energy around it.

Upsampling artifact. The upsampling layers of a generator produce periodic patterns that the eye barely perceives but that appear as energy peaks in the middle and high bands of the spectrum.

Frequency inconsistency. A real camera produces a consistent frequency signature across the whole image; a fake composed from several sources, or passed through a generative network, breaks this consistency.

A spatial network can capture some of these traces, but inefficiently, because they are tiny and buried in image content. Projecting the image into the frequency domain pulls them out into separate coefficients, which is why the frequency branch runs in parallel with the spatial backbone. A measured real and fake pair illustrating this contrast is shown in Chapter 3.

4.  ## The Detection Problem and the Generalisation Challenge
    
    1.  ###  ***The binary classification problem***

Deepfake detection is a binary classification problem at the image level: given a face image \(x\), the model \(f_{\theta}\) outputs

\(\widehat{y} = f_{\theta}\left( x \right) \in \left\lbrack 0,1 \right\rbrack\)

the probability that the image is fake, with label \(y\) equal to 0 for real and 1 for fake, trained with the binary cross-entropy loss

\(L = - \left\lbrack \text{ylog}\widehat{y} + \left( 1 - y \right)\log\left( 1 - \widehat{y} \right) \right\rbrack\)

The main metric is the AUC \[21\], the area under the ROC curve: the probability that the model ranks a random fake above a random real, independently of any threshold. It is preferred over accuracy, which depends on a fixed threshold and is sensitive to the class imbalance typical of deepfake datasets.

###  ***The generalisation gap***

A model trained and tested on the same dataset usually scores very high, but drops sharply on a different dataset. The cause is shortcut learning: the model relies on artifacts specific to the pipelines in its training set, for example an upsampling pattern at one particular frequency, and that cue disappears on a dataset made by a different pipeline.

To generalise, the model must be steered towards traces that do not depend on any single pipeline. The thesis therefore prioritises the frequency domain, where the underlying causes, every generator must upsample and every blend breaks frequency consistency, produce more universal traces. For the same reason, the evaluation trains on one dataset and tests on another, measuring exactly the property we care about.

###  ***Datasets and the evaluation protocol***

In real eKYC use, uploaded images are almost always compressed, and compression erases part of the high frequency energy where artifacts live. The training data is therefore used at a moderate compression level, and a useful detector must remain robust under this condition.

FaceForensics++ is the training set: one thousand real videos and four corresponding fake sets, one per method in Table 1.6. Celeb-DF-v2 \[3\] is the test set: a high quality deepfake dataset whose fakes have been refined to remove the coarse artifacts of older datasets. Its synthesis pipeline is entirely different from the training set, making it an ideal generalisation test; it is used only for testing, never for training.

All training and evaluation follow DeepfakeBench \[4\], a public framework that standardises preprocessing, data splits, and metric computation, allowing direct comparison with published baselines. The thesis baseline reproduces the published backbone figure closely, confirming the pipeline is correct before any improvement is attempted; the full results, including configurations that did not improve over the baseline, are reported honestly in Chapter 3.

*Table 1.7: The two datasets.*

| **Property**     | **FaceForensics++** | **Celeb-DF-v2** |
| ---------------- | ------------------- | --------------- |
| Role             | training            | testing         |
| Real videos      | 1000                | 590             |
| Fake videos      | 4000                | 5639            |
| Forgery methods  | 4                   | 1               |
| Frames per video | 32                  | 32              |

5.  ## The Detection Problem and the Generalisation Challenge
    
    1.  ###  The role of eKYC against deepfakes
    
    2.  ###  Circular 17/2024/TT-NHNN and the chosen operating point
    
    3.  ###  The need for explainability

6.  ## Liveness Detection Theory
    
    1.  ###  The role of liveness in eKYC
    
    2.  ###  Types of presentation attack
    
    3.  ###  Passive and active liveness

7.  ## Amazon Web Services

Amazon Web Services is the most widely adopted cloud platform in the world. It offers a large set of services from global data centres, letting organisations build infrastructure, store and process data, and run applications without owning physical hardware. DeepGuard is deployed on this platform so that the same containerised system validated locally runs unchanged in the cloud. The services used are described below.

  - > EC2 provides scalable virtual servers in the cloud, configurable with a chosen operating system, processor, memory, and storage. In DeepGuard a single instance is the production host that runs the frontend, the backend, the model service, and the database together as one unit. Because the model runs on a processor rather than a graphics card, the instance is sized for memory.

  - > S3 is an object storage service for keeping data such as images, model files, and backups inside containers called buckets. It is the natural place to hold uploaded media, model checkpoints, and exported audit files.

  - > ACM provides free certificates for securing HTTPS traffic. In DeepGuard it supplies the certificate for the public domain, so all browser traffic and external integrations travel over HTTPS.

  - > CloudWatch collects and stores logs from the cloud resources. In DeepGuard it monitors backend activity, tracks error rates, and triggers alerts when an anomaly occurs.

  - > An Elastic IP is a fixed public address assigned to an instance, keeping the backend reachable at the same address even after restarts. This is the address the domain name points to.

Together, these services let the system validated locally run unchanged in the cloud, behind a stable and secured public address.

## Conclusion

This chapter has set out both the engineering and the scientific foundations of the DeepGuard platform and its detector. On the engineering side, it covered the web technologies that make the system usable: JavaScript as the behavioural layer of the browser, Next.js and React for the dashboard, FastAPI as the guarded backend gateway, the HTTP and REST contract that ties the parts and the external clients together, and DNS that maps the public domain to the host.

On the scientific side, the detector was built up from its parts. The EfficientNet-B4 backbone contributes compound scaling, the MBConv block, and transfer learning from ImageNet. The block-wise DCT representation supplies the frequency feature. The gated cross-attention with a zero initialised gate fuses the two branches and guarantees a performance floor no worse than the backbone alone. These tools were then grounded in their domain: deepfakes are generated by autoencoder swap, generative adversarial networks, and diffusion, and the central hypothesis is that forgery traces are weak in pixels but clear in the middle and high frequency bands. The generalisation gap motivates training on one dataset and testing on another, under which the honest standings of the baseline and the proposed model are reported in Chapter 3. The eKYC context turns the qualitative biometric requirement of Circular 17 into a concrete operating point under an international standard, with Grad-CAM supplying the explainability a regulated setting needs. The secondary liveness module adds the taxonomy of print, replay, and mask attacks, the distinction between passive and active liveness, and the standard metrics. Finally, the chapter surveyed the cloud services that carry the platform into production.

On this foundation, Chapter 2 presents the system analysis and design in detail: the requirements, the use cases and architecture, the deepfake detection method, and the secondary liveness detection method.

# **Chapter** 2**:** SYSTEM ANALYSIS AND DESIGN

{Để 2 dòng trống}

1.  ##  Requirement analysis
    
    1.  ###  Functional requirements

**Deepfake Detection**

  - > The system accepts a face image or a frame extracted from an eKYC video and normalises it to a fixed size.

  - > It runs the detection model to obtain a fake probability and returns a real, fake, or uncertain verdict.

  - > It generates a heat map of the suspicious regions to explain each decision, and applies a decision threshold calibrated for the eKYC context.

**Liveness Detection**

  - > The system checks whether the subject is a live person rather than a printed photo or a screen replay.

  - > It supports a passive single-image mode and an active mode that asks the user to perform an action.

  - > When the result is a spoof, it also identifies the type of attack.

**User Interface and Upload Features**

  - > A web-based interface allows users to upload an image or video and view the analysis result.

  - > Users can inspect the heat map and the frequency spectrum, and browse the detection history.

  - > External systems can upload through the authenticated API instead.

**Monitoring and Alert Integration**

  - > The system logs inference traffic, latency, and errors for real-time monitoring.

  - > It sends alerts to a team chat channel when an error or performance problem occurs.
    
    1.  ###  Non-functional requirements

**Performance**

  - > The model is evaluated by its cross-dataset accuracy, and the target is to score above the baseline.

  - > Inference must remain fast and consistent, within about one second per image on the deployed system

**Scalability**

  - > The architecture must support concurrent requests from multiple users without performance degradation.

  - > The backend and the model service can be scaled independently as load grows.

**Availability and Reliability**

  - > The system should maintain high uptime during deployment and usage.

  - > It must degrade gracefully and recover automatically when a service fails.

**Maintainability**

  - > The codebase follows a modular design so that the model, the API, and the interface can be updated independently.

  - > The model is replaceable behind a fixed contract without changing the rest of the system.

**Usability**

  - > The interface should be intuitive, with clear instructions for uploading files.

  - > Results must be presented in a clear and interpretable format, including the explanation heat map.

**Portability**

  - > The system should be deployable on local servers and on the cloud without changes.

  - > All services run as independent containers.

**Monitoring and Logging**

  - > The system logs key actions such as uploads, predictions, and errors for analysis and debugging.
    
    1.  ##  System design
        
        1.  ***Use case diagram***

Beyond the detection model that performs the core inference, DeepGuard is delivered as a multi-tenant web platform, so this section sets out who may use each capability. Authentication is split into two layers that are never mixed: a login-token layer for the dashboard, and an API-key layer for external eKYC integration.

**Actors in the system**

*Table 2.6: Actors in the system.*

| **Actor**  | **Description**                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Anonymous  | An unauthenticated visitor. Browses public pages, registers a new organisation, or accepts a team invitation.    |
| Viewer     | A read-only member of a tenant. Views detection history and analytics, with personal data masked.                |
| Developer  | A tenant member responsible for integration. Runs the dashboard playground and manages API keys and webhooks.    |
| Compliance | A tenant member responsible for review. Views the flagged queue with full data and attaches audit notes.         |
| Admin      | The administrator of a single tenant. Manages members, roles, keys, and settings within their own organisation.  |
| Sysadmin   | The platform operator across all tenants. Creates and activates tenants and edits model versions and thresholds. |

**Overview use case diagram**

flowchart LR

Anon(\[Anonymous\])

Viewer(\[Viewer\])

Dev(\[Developer\])

Comp(\[Compliance\])

Admin(\[Admin\])

Sys(\[Sysadmin\])

Client(\[External eKYC client\])

subgraph DeepGuard\[DeepGuard platform\]

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

Anon --\> UC4

Viewer --\> UCv

Dev --\> UCv

Dev --\> UC1

Dev --\> UC2

Dev --\> UC3

Dev --\> UC6

Comp --\> UC8

Admin --\> UC6

Admin --\> UC7

Sys --\> UC5

Client --\> UC1

Client --\> UC2

Client --\> UC3

*Figure 2.1: Overview use case diagram.*

2.  ***Use case specification***

**Use case specification for detecting a deepfake on an image**

*Table 2.7: Use case specification for detect deepfake on an image.*

| **Use Case Name** | **Detect deepfake on an image**                                                                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID       | UC-01                                                                                                                                                                                                                                                           |
| Actor             | Developer, Admin (dashboard); external eKYC client (API)                                                                                                                                                                                                        |
| Description       | The system analyses a single face image and returns a fake probability, a verdict, and a heat map explaining the decision.                                                                                                                                      |
| Trigger           | The user uploads an image and presses analyse, or the client posts an image to the detection endpoint.                                                                                                                                                          |
| Pre-condition     | A valid login token or API key, an active tenant, and remaining quota.                                                                                                                                                                                          |
| Post-condition    | A detection result is produced and returned, and can be retrieved later by its identifier.                                                                                                                                                                      |
| Basic Flow        | The actor submits the image. The system authenticates and checks quota. The face is detected and cropped. The crop is sent to the model service. The service returns the probability and heat map. The system maps the probability to a verdict and returns it. |
| Alternative Flow  | A score near the threshold is returned as uncertain; a playground request counts quota but is not stored.                                                                                                                                                       |
| Exception Flow    | No face detected returns an error; an invalid token is rejected; an exhausted quota is refused; an unreachable model service returns an error.                                                                                                                  |

**Use case specification for detecting a deepfake on a video**

*Table 2.8: Use case specification for detect deepfake on a video.*

| **Use Case Name** | **Detect deepfake on a video**                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID       | UC-02                                                                                                                                                                                                                 |
| Actor             | Developer, Admin (dashboard); external eKYC client (API)                                                                                                                                                              |
| Description       | The system samples frames from a video, runs detection on each, and aggregates an overall verdict; long videos run as an asynchronous job.                                                                            |
| Trigger           | The user uploads a video, or the client posts a video to the detection endpoint.                                                                                                                                      |
| Pre-condition     | A valid login token or API key, an active tenant, and remaining quota.                                                                                                                                                |
| Post-condition    | An aggregated verdict and a per-frame view are returned; a long video returns a job identifier to poll.                                                                                                               |
| Basic Flow        | The actor submits the video. The system authenticates and checks quota. Representative frames are sampled and cropped. Each frame is sent to the model service. The per-frame scores are aggregated into one verdict. |
| Alternative Flow  | A large video returns a job identifier; the client polls until the job completes and then fetches the result.                                                                                                         |
| Exception Flow    | No face in any frame returns an error; an invalid token is rejected; an exhausted quota is refused; a failed job is reported on the job status.                                                                       |

**Use case specification for the liveness check**

*Table 2.9: Use case specification for liveness check.*

| **Use Case Name** | **Liveness check**                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID       | UC-03                                                                                                                                                |
| Actor             | Developer (dashboard); external eKYC client (API)                                                                                                    |
| Description       | The system decides whether the subject is a live person rather than a printed photo or a screen replay, and identifies the attack type on a spoof.   |
| Trigger           | The client submits an image for a passive check, or requests a challenge and submits the captured frames for an active check.                        |
| Pre-condition     | A valid API key (or login token for the playground); for the active mode, a previously issued challenge.                                             |
| Post-condition    | A live, spoof, or uncertain verdict is returned, with the attack type when the verdict is spoof.                                                     |
| Basic Flow        | The client submits the image. The system runs the liveness model. The verdict and, if a spoof, the attack type are returned.                         |
| Alternative Flow  | The active mode first requests a challenge and captures the required frames; a score near the threshold is returned as uncertain, prompting a retry. |
| Exception Flow    | No face or a poor-quality frame returns an error; an invalid key is rejected; an expired challenge is refused.                                       |

The remaining use cases follow the same template and are summarised below.

*Table 2.10: Summary of the supporting use cases.*

| **Use case**          | **Actor**        | **Description**                                                                                     |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| Register organisation | Anonymous        | Register a new organisation, created in a suspended state until the operator activates it.          |
| Approve tenant        | Sysadmin         | Review and activate a registered organisation, or create one directly.                              |
| Manage API keys       | Developer, Admin | Create, inspect, and revoke the API keys used by the external integration; a new key is shown once. |
| Manage team           | Admin            | Invite members, assign roles, and reset passwords within the administrator's own organisation.      |
| Review and add note   | Compliance       | Review the flagged queue with full data and attach an investigation note for traceability.          |

### 

3.  ***System architecture***

*Figure 2.2: System architecture.*

The system is organised into 4 blocks, each with one responsibility, so that a block can be replaced without breaking the rest.

  - > **Frontend:** the dashboard and playground. Renders the upload interface, the risk score and band, the heat map, the frequency spectrum, the history, and the management screens. It calls the backend only.

  - > **Backend:** the home of the business logic. Enforces the two authentication layers, checks quota and rate limit, performs the face crop, forwards the crop to the model service, and maps the probability into a risk band. All data access goes through one database layer, scoped per tenant.

  - > **Model service:** a separate process that runs the spatial and frequency branches and returns the probability, the verdict, and the heat map. It is a black box behind a fixed contract, so the model can be replaced without touching the rest.

  - > **Monitoring and logging:** health checks on the backend and the model service, structured logging, and latency and error metrics, giving operators visibility into traffic and failures.

  - > **Alerting:** a webhook that posts to a team chat channel when an anomaly is detected, such as an unreachable model service or an exhausted quota.
    
    1.  ###  Activity diagram

***Activity diagram for deepfake image detection***

The dashboard path authenticates the user, checks quota, crops the face, runs the model, and maps the probability to a verdict; it stops early if no face is found or the quota is used up.

flowchart TD

A(\[Start\]) --\> B\[User selects an image\]

B --\> C{Token valid and role allowed?}

C -- No --\> E\[Reject the request\] --\> Z(\[End\])

C -- Yes --\> F{Quota available?}

F -- No --\> G\[Refuse: quota exhausted\] --\> Z

F -- Yes --\> H\[Detect and crop the face\]

H --\> I{Face found?}

I -- No --\> J\[Return: no face detected\] --\> Z

I -- Yes --\> L\[Send the crop to the model service\]

L --\> M\[Forward pass gives a probability\]

M --\> O{Map the probability to a band}

O -- "high" --\> P\[verdict = fake\]

O -- "low" --\> Q\[verdict = real\]

O -- "near the threshold" --\> R\[verdict = uncertain\]

P --\> T\[Render the score, band, and heat map\]

Q --\> T

R --\> T

T --\> Z

Figure 2.3: Activity diagram for deepfake image detection.

**Activity diagram for the eKYC cascade**

The integration path runs the liveness check first and only forwards a live capture to the deepfake stage, so a presentation attack is rejected before any deepfake analysis.

flowchart TD

A(\[Start: a face frame\]) --\> B\[Liveness check with an API key\]

B --\> H{Liveness band}

H -- "spoof" --\> I\[Reject: presentation attack\] --\> Z(\[End\])

H -- "uncertain" --\> J\[Request a retry\] --\> Z

H -- "live" --\> L\[Deepfake stage on the same frame\]

L --\> N{Deepfake band}

N -- "fake" --\> O\[Reject: deepfake suspected\] --\> Z

N -- "uncertain" --\> P\[Escalate to manual review\] --\> Z

N -- "real" --\> Q\[Approve: live and genuine\] --\> Z

Figure 2.4: Activity diagram for the eKYC cascade.

###  Sequence diagrams

**Deepfake detection sequence diagram**

The backend performs the face crop, calls the model service, maps the score into a band, and returns one response to the browser.

sequenceDiagram

actor U as User

participant FE as Frontend

participant BE as Backend

participant ML as Model service

U-\>\>FE: Upload an image

FE-\>\>BE: Send the image with a login token

BE-\>\>BE: Check the role and quota, crop the face

BE-\>\>ML: Send the cropped face

ML--\>\>BE: Return the probability, verdict, and heat map

BE-\>\>BE: Map the probability to a band

BE--\>\>FE: Return the score, band, and heat map

FE--\>\>U: Render the result

*Figure 2.5: Deepfake detection sequence diagram.*

**eKYC cascade sequence diagram**

The customer backend calls the liveness check first; only a live verdict forwards the same frame to the deepfake stage, and both records are stored per tenant.

sequenceDiagram

participant C as Customer backend

participant API as Backend

participant SF as Model service

C-\>\>API: Liveness check with an API key

API-\>\>SF: Send the crop to the liveness head

SF--\>\>API: Return the score and verdict

alt spoof or uncertain

API--\>\>C: Return spoof or uncertain

else live

C-\>\>API: Deepfake stage on the same frame

API-\>\>SF: Send the crop to the deepfake head

SF--\>\>API: Return the probability and verdict

API--\>\>C: Return the combined outcome

end

*Figure 2.6: eKYC cascade sequence diagram.*

3.  ***API specifications***

**Detect deepfake API**

*Table 2.11: API specification for detecting a deepfake on an image.*

| **Description** | **This API takes a face image and returns a fake probability, a verdict, and a heat map.**                     |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Endpoint        | /v1/detect/image                                                                                               |
| HTTP Method     | POST                                                                                                           |
| Payload         | multipart/form-data with a single face image                                                                   |
| Response        | { "request\_id": "det\_…", "risk\_score": 0.087, "risk\_band": "low", "verdict": "real", "gradcam\_b64": "…" } |

**Detect deepfake on a video API**

*Table 2.12: API specification for detecting a deepfake on a video.*

| **Description** | **This API takes a video, samples frames, and returns an asynchronous job to poll for the aggregated verdict.** |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Endpoint        | /v1/detect/video                                                                                                |
| HTTP Method     | POST                                                                                                            |
| Payload         | multipart/form-data with a video file                                                                           |
| Response        | { "job\_id": "job\_…", "status": "queued", "result\_url": "/v1/jobs/job\_…" }                                   |

**Liveness check API**

*Table 2.13: API specification for the liveness check.*

| **Description** | **This API takes a face image and returns a liveness score, a verdict, and the attack type when a spoof is detected.** |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Endpoint        | /v1/detect/liveness                                                                                                    |
| HTTP Method     | POST                                                                                                                   |
| Payload         | multipart/form-data with a single face image                                                                           |
| Response        | { "check\_id": "liv\_…", "score": 0.31, "verdict": "spoof", "spoof\_type": "screen" }                                  |

The model behind the liveness endpoint is the module of Section 2.4, whose measured results are reported in Chapter 3; the contract is fixed here so the API surface stays stable. The detection endpoints are reached over an API key and consume one unit of the tenant's monthly quota per call. The supporting authentication endpoints, for login, registration, accepting an invitation, creating an API key, and provisioning a tenant, gate access to the two detection APIs and follow the same response conventions.

1.  ##  Method - Deepfake Detection
    
    1.  ***Data Solutions***

The quality of the frequency features depends directly on the quality of the preprocessing, since a misaligned or badly compressed crop can create spurious frequency artefacts. The data pipeline therefore follows the DeepfakeBench protocol strictly, for fairness and reproducibility.

**Data sources and label alignment**

The model is trained on FaceForensics++ at a moderate compression level and tested on Celeb-DF-v2, which it never sees during training. Keeping the training and test sets in two different distributions is exactly how generalisation is measured. Each frame inherits its label from the video it comes from: every sampled frame of a forged video is labelled fake, and every frame of a genuine video is labelled real.

*Table 2.22: Data sources and their role.*

| **Dataset**       | **Scale**                                      | **Role**                         |
| ----------------- | ---------------------------------------------- | -------------------------------- |
| FaceForensics++   | 1000 real videos and 4 forgery methods         | training                         |
| Celeb-DF-v2       | 590 real and 5639 high-quality deepfake videos | cross-dataset test, no training  |
| Other public sets | not used here                                  | future cross-dataset evaluation  |
| Vietnamese set    | collection in progress                         | eKYC-realistic test, in progress |

The logic of the split is simple. FaceForensics++ provides a diversity of manipulation types, so the model can learn forgery traces that generalise. Celeb-DF-v2, with its high-quality deepfakes, plays the role of an examination: if the model has merely memorised the artefacts specific to the training set, it fails here. The cross-dataset accuracy on Celeb-DF-v2 is therefore a faithful measure of generalisation.

**Preprocessing**

Each frame is passed through a face detector to locate the face and its landmarks, aligned to a canonical pose, and cropped to a fixed size. When the face lies near the border, padding preserves the ratio without distorting the geometry. The crop is then normalised to a standard range.

*Table 2.23: Face preprocessing steps.*

| **Step** | **Operation**               | **Input**             | **Output**                 |
| -------- | --------------------------- | --------------------- | -------------------------- |
| 1        | face and landmark detection | the raw frame         | the face box and landmarks |
| 2        | alignment                   | the box and landmarks | a pose-corrected face      |
| 3        | crop and padding            | the aligned face      | a fixed-size image         |
| 4        | normalisation               | the fixed-size image  | a normalised tensor        |

Strict alignment matters because the frequency branch divides the image into fixed 8x8 blocks. If faces are not aligned consistently, the same region of the face falls into different blocks across images, and the per-band statistics get corrupted. Good alignment keeps the frequency features stable and comparable.

**Frame sampling**

Each video is sampled at thirty-two frames spread evenly along its length, and each sampled frame is cropped as above. A frame-level model does not need every frame, only a representative set that covers the variation in pose, expression, and lighting. This number balances coverage against cost and is held constant across all configurations for a fair comparison.

**Augmentation**

Augmentation is applied only during training, to increase diversity and reduce overfitting. The pipeline uses standard geometric and photometric augmentations: horizontal flip, small rotation, mild blur, brightness and contrast jitter, and simulated compression at varying quality. Augmentations that strongly affect the spectrum are designed carefully, since they could otherwise erase the very traces the model needs.

**Storage**

Sampled crops are stored at the fixed size with their labels, so the expensive detection and alignment step runs once rather than every epoch, and re-runs stay deterministic under a fixed seed.

**Reasons for the design choices**

A few choices in the frequency branch are deliberate rather than arbitrary; the reasons are summarised below.

*Table 2.24: Reasons for the main design choices.*

| **Design choice**           | **Justification**                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 8x8 block size              | matches the JPEG block grid, so compression and forgery artefacts align with the blocks and become more visible |
| brightness-and-colour space | separates brightness from colour, since compression and artefacts behave differently on each                    |
| sixteen frequency bands     | a compact summary that keeps the per-band signature stable while reducing noise                                 |
| dropping the lowest bands   | the low bands carry mainly content, so removing them stops the model learning the person instead of the forgery |
| fixed input size            | keeps the block grid aligned across images and fits a single mid-range GPU                                      |

### 

2.  ***Evaluation method and loss function***

**Metrics**

The headline metric is the cross-dataset accuracy at the frame level, measured by the area under the ROC curve. It is preferred for two reasons: it is independent of any threshold, measuring the quality of the real-and-fake ranking, and it is the comparison standard of the benchmark, allowing a fair comparison with other methods. The average precision, the equal error rate, and the threshold-dependent accuracy are also reported as supplementary references.

**Loss function**

Both architectures are trained with the standard cross-entropy on the real-and-fake label:

\(L_{\text{CE}} = - \left\lbrack \text{ylog}\widehat{y} + \left( 1 - y \right)\log\left( 1 - \widehat{y} \right) \right\rbrack\)

Where:

  - > \(y\): the ground-truth label, 0 for real and 1 for fake.

  - > \(\widehat{y}\): the probability predicted by the model.

The cross-entropy is kept deliberately, with no extra loss terms, so that the comparison with the benchmark baselines stays fair and any difference comes from the architecture rather than from a different objective.

**Training configuration**

The configuration is identical across all architectures, so any difference comes from the architecture, not from tuning.

  - > Optimizer: Adam, with a fixed learning rate and weight decay.

  - > Batch size: thirty-two; frames per video: thirty-two; input at a fixed size.

  - > Normalisation to a standard range; cross-entropy as the loss.

  - > Ten epochs, with no scheduler and no early stopping; the checkpoint with the best test score is kept.

  - > A single fixed seed; multi-seed runs are noted as future work.
    
    1.  ***EfficientNet-B4 (spatial branch)***

The spatial branch is EfficientNet-B4, pretrained on ImageNet, and it carries most of the classification capability. As discussed in Chapter 1, EfficientNet grows depth, width, and resolution together through compound scaling, and its basic unit is the MBConv block. B4 is chosen because it offers strong accuracy at a budget that fits a single mid-range GPU: large enough to learn rich facial features, small enough to serve at an acceptable latency. Transfer learning from ImageNet gives the branch a strong prior before it is fine-tuned. On its own, with the frequency gate closed, this branch is the baseline whose score is reported in Chapter 3, and it is exactly the floor the fusion design protects.

2.  ***SFDCT architecture***

**Two-branch overview**

SFDCT has two parallel branches sharing the same input. The spatial branch is EfficientNet-B4, extracting semantic and textural features. The frequency branch transforms the image into the frequency domain with a block-wise 8x8 DCT and summarises it over sixteen frequency bands, producing a representation focused on frequency-domain forgery traces. The two branches meet at a gated cross-attention module, where the frequency features are injected into the spatial features through a gate that starts closed. The idea is that forcing one network to learn both semantics and the spectrum invites conflict, so each branch specialises and they fuse under control: the frequency branch acts as a consulting expert that the backbone may consult when needed.

*Figure 2.2: Overall architecture of SFDCT.*

**The block-DCT frequency branch**

This is the heart of the representation: turning a face image into a compact, stable, forgery-informative set of frequency features through four steps.

Step 1, convert to the brightness-and-colour space. The image is converted from colour to a space that separates brightness from colour, because compression and forgery artefacts behave differently on each, so separating them reveals anomalies that the colour image blends together.

Step 2, block-wise DCT. The image is divided into non-overlapping 8x8 blocks, and on each block the two-dimensional DCT coefficient is

\(F\left( u,v \right) = \frac{1}{4}C\left( u \right)C\left( v \right)B\left( x,y \right)\cos\left\lbrack \frac{\left( 2x + 1 \right)\text{uπ}}{16} \right\rbrack\cos\left\lbrack \frac{\left( 2y + 1 \right)\text{vπ}}{16} \right\rbrack\)

Where:

  - > \(B\left( x,y \right)\): a pixel of the 8x8 block.

  - > \(F\left( u,v \right)\): the coefficient at frequency position \(\left( u,v \right)\).

  - > \(C\left( 0 \right)\) = 1/\\sqrt{2}$ and \(C\left( k \right)\) = 1 for k \> 0: the normalisation factors.

The 8x8 size is exactly the JPEG block size, so compression and forgery artefacts tend to align with the block grid and stand out in the coefficients.

Step 3, log-magnitude. The coefficients are compressed with $D(u,v) = \\log(1 + |F(u,v)|)$, because the lowest coefficient is thousands of times larger than the high-frequency ones; without this, the small high-frequency traces, where the forgery evidence lives, would be overwhelmed.

Step 4, group into sixteen bands. The sixty-four coefficients of each block are read in zigzag order, from the lowest frequency to the highest, and grouped into sixteen bands. For each band, the mean and the standard deviation are computed:

\(\mu_{b} = \frac{1}{\left| B_{b} \right|}D\left( u,v \right),\quad\quad\sigma_{b} =\)

Where:

  - > $\\mathcal{B}\_b$: the set of coefficient positions in band b.

  - > $\\mu\_b, \\sigma\_b$: the mean and standard deviation of that band.

The result is a compact vector describing the per-band spectral signature. Optionally, the lowest bands are dropped before fusion: they mainly carry content such as shape and brightness rather than forgery traces, and keeping them risks the model learning the person instead of the forgery.

*Table 2.25: The block-DCT frequency branch.*

| **Step** | **Operation**                         | **Output**                         | **Role**                       |
| -------- | ------------------------------------- | ---------------------------------- | ------------------------------ |
| 1        | colour to brightness-and-colour space | brightness and two colour channels | separate the channels          |
| 2        | block-wise DCT                        | a coefficient grid per block       | move to the frequency domain   |
| 3        | log-magnitude                         | compressed coefficients            | emphasise the high frequencies |
| 4        | group into 16 bands                   | a mean and deviation per band      | a compact spectral signature   |

**Zero-initialised gated fusion**

The fusion problem is how to combine the frequency features into the backbone without any risk of making the model worse, since a brute-force combination of an under-trained branch could inject noise and drag the model below the baseline. The solution is a gate that starts closed. The fused feature is

\(\text{feature}_{\text{fused}} = x + \alpha \cdot context,\quad\quad\alpha\ initialised\ at\ 0\)

Where:

  - > \(x\): the spatial feature from the backbone.

  - > \(\text{context}\): the frequency representation after cross-attention.

  - > \(\alpha\): a learnable gate, initialised at zero.

At the start, with the gate at zero, the fused feature equals the spatial feature, so the model is exactly the backbone. It then decides for itself whether to open the gate: if the frequency branch helps, the gradient pushes the gate open; if not, the gate stays near zero and the model remains safely at the baseline.

*Table 2.26: Meaning of the gate value.*

| **Gate value**     | **Model state**       | **Interpretation**                            |
| ------------------ | --------------------- | --------------------------------------------- |
| zero, at the start | the backbone          | the safe floor, never worse than the baseline |
| small positive     | lightly supplementary | the backbone dominates, frequency fine-tunes  |
| larger             | strong contribution   | frequency traces genuinely matter             |

This property, the floor guarantee, is the most important safety feature of the design, and the learned gate value is reported in Chapter 3 to show how much the model relies on the frequency branch. The technique follows zero-initialised residual gating used in modern architectures \[31\]. By contrast, a related published model starts its gate half open and adds an extra branch, so it carries no such floor guarantee; the zero start is exactly what makes the guarantee hold here.

The base SFDCT gives a modest improvement over the backbone that, as Chapter 3 reports, lies within statistical noise. This motivates the improved variant in the next subsection.

1.  ***SFDCT-HFF architecture***

The improved variant, SFDCT-HFF, keeps the same backbone and the same zero-start gate but changes how the frequency information is represented. Where the base SFDCT summarises the spectrum into per-band statistics, SFDCT-HFF keeps the frequency information as an image, so that the spatial structure of the forgery traces, such as blending boundaries and grid patterns, is preserved. It adapts the high-frequency-features idea of Luo et al. \[7\] into the block-DCT setting.

**Model structure**

  - > Input: the same fixed-size face crop as the base detector.

  - > High-pass residual: the block-DCT coefficients are computed, the low-frequency bands are set to zero, and an inverse transform reconstructs a residual image in which the content is suppressed and the high-frequency traces dominate.

  - > Multi-scale stream: a convolutional stream processes this residual with parallel kernels of different sizes, capturing artefacts at several spatial scales.

  - > Residual-guided attention: the output of the stream produces an attention map over the backbone feature map, telling the spatial backbone where the high-frequency evidence is.

  - > Fusion: the result merges into the backbone through the same zero-start gate as the base detector, which preserves the floor guarantee.

*Figure 2.3: Overall architecture of SFDCT-HFF.*

Two versions are built: a minimal one, with a single-scale stream and no attention, and a full one, with the multi-scale stream and the residual-guided attention. Chapter 3 reports the full version as the strongest measured member of the family, while noting honestly that its confidence interval against the baseline still contains zero. Because SFDCT-HFF reuses the same backbone, loss, and gate, the comparison with the base SFDCT is controlled: the only thing that changes is the frequency representation, so any difference is attributable to it.

1.  ***Risk score and decision inference***

**Principle**

In eKYC, the model should return a risk signal, not a hard label, because the provider knows its own fraud appetite and regulation and makes the final call. Two principles follow: the probability should be calibrated, so that a high score really means high risk, and the score should be summarised into bands that map to plain-language hints, because operators act on bands rather than on three-decimal probabilities. The band thresholds are per tenant, so each customer can tune them to its own budget.

**Mechanism**

The mechanism has four steps, from the raw probability to a decision.

Step 1, calibrate to a risk score. The probability is adjusted by temperature scaling \[19\], which leaves it unchanged when the fitted temperature is one and otherwise sharpens or softens it to be more trustworthy.

Step 2, map the score to a band. The score is split into low, medium, and high using per-tenant thresholds.

Step 3, derive a decision hint. The band maps to a hint that the provider may follow or override: low to pass, medium to review, high to reject. This is a suggestion, never the final decision.

Step 4, calibrate the eKYC threshold. The accuracy is independent of any threshold, but a deployed system needs a concrete cut-off. The threshold is calibrated so that the false positive rate, the proportion of real images wrongly flagged, stays at or below 5 percent, following an international standard, to satisfy the qualitative biometric requirement of Circular 17/2024/TT-NHNN. The circular mandates biometric verification but prescribes no number, so the 5 percent figure is our engineering choice. The threshold is found as

\(\tau^{*} = arg\max_{\tau}\text{\;TPR}\left( \tau \right)\text{\quad subject\ to\quad FPR}\left( \tau \right) \leq 0.05\)

Where:

  - > \(\text{TPR}\left( \tau \right)\): the fraction of fakes caught at threshold \(\tau\).

  - > \(\text{FPR}\left( \tau \right)\): the fraction of real images wrongly flagged.

In words, the smallest threshold whose false positive rate does not exceed 5 percent is chosen, and the corresponding catch rate is read off. The calibrated operating point of the trained model is reported in Chapter 3.

**Summary**

This layer turns a raw probability into a calibrated, banded signal plus a single threshold tied to the false positive budget. Its limits are stated openly: at a threshold that keeps the false positive rate below 5 percent, the single-frame model catches only a minority of deepfakes, with the exact numbers in Chapter 3. That gap is the design reason the deepfake stage is placed behind a liveness pre-filter and complemented by video-level aggregation: at a customer-friendly operating point, the single-frame model is a screening layer, not a stand-alone gate. One caveat: the threshold here is set on the test scores directly, because a separate validation split has not yet been carved out; in real deployment it must be calibrated on data from the deployment distribution, that is, Vietnamese faces.

1.  ***Statistical tools***

The conclusions rest on small differences between models, so the statistical machinery is stated explicitly.

**The accuracy as a ranking probability.** With fake scores and real scores, the area under the ROC curve \[21\] is

\(AUC = \frac{1}{N_{f}N_{r}}\left\lbrack 1\left( s_{i} > t_{j} \right) + \frac{1}{2}\, 1\left( s_{i} = t_{j} \right) \right\rbrack\)

Where:

  - > \(s_{i}\): the score of a fake sample,\(\text{\ N}_{f}\) in total.

  - > \(t_{j}\): the score of a real sample, \(N_{r}\) in total.

This is the probability that a randomly chosen fake is ranked above a randomly chosen real, and it makes clear why the accuracy needs no threshold.

**Bootstrap confidence intervals.** A single number carries no uncertainty, so a confidence interval is attached by resampling at the video level, since the frames of one video are strongly correlated. Video identities are drawn with replacement, the score is recomputed, the process repeats many times, and the interval is read from the percentiles. For a comparison against the baseline, the same resampled set is applied to both models in each repeat, and the difference is recorded; if the interval of the difference contains zero, the two models are not statistically separated, a criterion Chapter 3 uses throughout.

**Temperature scaling.** The calibration of Step 1 fits a single number that minimises the negative log-likelihood on a calibration split \[19\]; a value of one leaves the probability unchanged, and a larger value softens over-confident scores.

##  Method - Liveness Detection

Liveness is a secondary module, designed by reusing the SFDCT components and trained and measured on a public anti-spoofing dataset, with the results reported in Chapter 3. Two heads are compared, the spatial baseline and the spatial-plus-frequency proposal, exactly mirroring the deepfake comparison. As on the deepfake side, the frequency branch does not improve over the spatial head on this dataset, an honest negative reported rather than hidden. The metrics follow the international anti-spoofing standard \[13\], with the attack as the positive class.

1.  Data Solutions

**Data collection**

Following a cheap-and-reusable strategy, two still-image datasets are used. LCC-FASD, about eighteen thousand images covering print and replay attacks, is the primary training and evaluation set: it downloads directly without a licence agreement, its crops match the SFDCT input pipeline, and it runs on a single mid-range GPU. NUAA Imposter, about twelve thousand grayscale images of print attacks, is a smoke-test and sanity set used to confirm the pipeline generalises beyond the primary set. A larger public spoofing set could serve as an extension, with the primary set as a cross-test; heavier or licence-locked sets, including multi-modal ones with depth and infrared, are deliberately avoided. Where a community number is needed, the published result is cited rather than reproduced.

*Table 2.27: Liveness datasets and their role.*

| **Dataset**   | **Scale**          | **Attack types** | **Role**                        |
| ------------- | ------------------ | ---------------- | ------------------------------- |
| LCC-FASD      | about 18000 images | print, replay    | primary training and evaluation |
| NUAA Imposter | about 12600 images | print            | smoke-test and cross-check      |

**Preprocessing and augmentation**

The liveness pipeline reuses the SFDCT preprocessing exactly: detect the face, align, crop to a fixed size, and normalise to a standard range. This identical pipeline is the whole point of the reuse, since the same crops can feed either the deepfake head or the liveness head. Augmentation mirrors the deepfake pipeline, with flip, mild photometric jitter, and simulated compression. Strong spectral augmentation is used with caution, because the physical cue the frequency branch relies on, the recapture peaks left when a screen is photographed, can be blurred by aggressive compression.

**Reasons for the design choices**

The frequency settings are kept identical to the deepfake branch, so the same module serves both tasks.

*Table 2.28: Reasons for the main design choices.*

| **Design choice**              | **Justification**                                                           |
| ------------------------------ | --------------------------------------------------------------------------- |
| reuse the SFDCT preprocessing  | the same crops feed both the deepfake and liveness heads                    |
| same 8x8 block and 16 bands    | the frequency branch is literally the same module as in deepfake detection  |
| cautious spectral augmentation | aggressive compression can erase the recapture peaks the branch depends on  |
| lightweight datasets           | training and evaluation run on a single mid-range GPU without licence locks |

### 

###  Evaluation method and loss function

**Loss function**

Both heads are trained with the binary cross-entropy over the live-and-spoof label, the natural analogue of the deepfake loss:

\(L_{\text{CE}} = - \left\lbrack \text{ylog}\widehat{y} + \left( 1 - y \right)\log\left( 1 - \widehat{y} \right) \right\rbrack\)

Where:

  - > \(y\): the ground-truth label, 0 for a live face and 1 for a spoof.

  - > \(\widehat{y}\): the spoof probability predicted by the model.

The baseline needs no extra term. The proposal reuses the same gated fusion with the gate starting closed, so it begins equal to the baseline and can only add value.

**Metrics**

With the attack as the positive class, the standard anti-spoofing metrics are

\(APCER = \frac{N_{\text{attack\ as\ live}}}{N_{\text{attack}}},\quad\quad BPCER = \frac{N_{\text{live\ as\ attack}}}{N_{\text{live}}},\quad\quad ACER = \frac{1}{2}\left( APCER + BPCER \right)\)

Where:

  - > \(\text{APCER}\): the fraction of attacks wrongly accepted as live, the dangerous error.

  - > \(\text{BPCER}\): the fraction of genuine users wrongly rejected as attacks.

  - > \(\text{ACER}\): the average of the two at a single threshold.

The area under the ROC curve is the primary number, being independent of any threshold, mirroring the deepfake reporting. The operating threshold is chosen at the equal-error point on a development split and then fixed; it is never tuned on the test set, exactly as in the deepfake protocol. For eKYC, the genuine-rejection rate is also reported at the operating point where the attack-acceptance rate is at most 5 percent, tying the liveness operating point to the same budget adopted for deepfake. Targets for these metrics were recorded before training, so the plan had a concrete success criterion from the start; the measured results are reported in Chapter 3.

###  B4-liveness architecture (baseline)

The baseline is the most common deep anti-spoofing model: EfficientNet-B4 used as a spatial-only feature extractor, with a small binary head deciding live or spoof. It is fine-tuned from ImageNet, or from the deepfake checkpoint, which already carries a strong facial prior.

**Model structure**

  - > Input: the same fixed-size face crop as the deepfake pipeline.

  - > Backbone: EfficientNet-B4, extracting spatial and textural features.

  - > Head: a two-layer classifier on top of the backbone features.

  - > Output: a spoof probability and a live-or-spoof verdict.

*Figure 2.4: Architecture of the B4-liveness baseline.*

###  B4+DCT-liveness architecture (proposal)

The proposal reuses the spatial-plus-frequency design of SFDCT, adding the same block-DCT branch and the same zero-start gated fusion described in Section 2.3.4, with a binary head. The physical justification is the same in spirit as for deepfake detection: replay and print attacks leave faint frequency traces, the recapture peaks of a photographed screen and the dot pattern of a printer, that are weak in the pixel domain but visible in the frequency domain, so the frequency branch has a principled reason to help here too.

**Model structure**

  - > Input: the same fixed-size face crop.

  - > Spatial branch: EfficientNet-B4, as in the baseline.

  - > Frequency branch: the same block-DCT branch from the deepfake design, summarising the spectrum over the frequency bands.

  - > Fusion: the same gated cross-attention with the gate starting closed, which preserves the floor guarantee, so the proposal starts equal to the baseline.

  - > Head and output: a binary classifier giving a spoof probability and a verdict.

*Figure 2.5: Architecture of the B4+DCT-liveness proposal.*

One honest caveat belongs here: the recapture peaks are strongest for replay attacks, while print artefacts are mainly the dot pattern and printing noise, so the frequency branch may help replay more than print. This pair, the baseline against the proposal on the same backbone, lets the thesis ask for liveness the same question as for deepfake, namely whether the frequency branch generalises across attack types and across datasets. The closest prior art is the family of two-stream spatial-and-frequency anti-spoofing models; the distinction here is the block-wise DCT, the gated fusion, and a backbone shared between deepfake and liveness, and no claim of novelty is made without a proper check.

Operationally, the liveness head runs first in the eKYC cascade described in Section 2.2: a spoof or uncertain verdict stops the request before any deepfake compute. The ordering is partly about security and partly about compensation, since the deepfake model has low recall at the chosen operating point, so a cheap liveness pre-filter removes a whole class of presentation attacks before the expensive stage runs.

##  Conclusion

Chapter 2 presented a comprehensive analysis and design of the proposed eKYC system for deepfake and liveness detection. It began by identifying both the functional and non-functional requirements, followed by a detailed system design including the use case diagram, the use case specifications, the system architecture, the activity and sequence diagrams, and the API specification. The chapter then presented the two detection methods: a spatial-frequency deepfake detector that combines an EfficientNet-B4 backbone with a block-DCT frequency branch through a gated fusion, together with an improved variant that keeps the frequency information as a high-pass image, and a liveness module that reuses the same design and runs first in the cascade as a pre-filter. Chapter 3 will present the implementation and evaluation in detail to validate each design argument set out here.

# 

# **Chapter** 3**:** SYSTEM IMPLEMENTATION AND EVALUATION

{Để 2 dòng trống}

## 3.1. Experimental Results

This section reports the results for the two tasks in order of priority. The deepfake task comes first, as the primary contribution, fully measured under the standard cross-dataset protocol; the liveness task follows as a secondary measured module. Each task uses the same arc: data and preprocessing, then the design and training of each architecture, then a comparative evaluation, a discussion, and a conclusion.

### 3.1.1. Overview of the deepfake task - data and environment

**Experimental environment**

Before any number is read, the conditions under which it was produced must be clear, because a result only has meaning when the hardware, the software, and the protocol are fixed and described openly. The training and evaluation process is split into two phases following a smoke-test-before-train principle: a quick correctness check on the local machine, then full training on a rented cloud GPU.

*Table 3.1: Hardware used for the experiments.*

| **Item**      | **Local machine, for the smoke test**   | **Full-training machine**               |
| ------------- | --------------------------------------- | --------------------------------------- |
| GPU           | a 4 GB consumer card                    | a 24 GB high-end card, rented on demand |
| System memory | 32 GB                                   | per instance                            |
| Disk          | about 300 GB                            | at least 150 GB                         |
| Purpose       | shape check, dry run, overfit one batch | full training and evaluation            |

The local machine only verifies that the pipeline is correct: it checks the tensor shapes, runs a trial loop, and overfits a single batch to confirm the model can learn, since 4 GB of memory cannot hold a full batch at the working resolution. All full training and the final measurements run on the rented GPU.

The software stack is version-pinned for reproducibility. This matters most for the frequency branch, because its block-DCT transform and statistics are sensitive to small numerical differences between library versions, so only the same seed on the same stack reproduces the exact numbers. The evaluation uses the DeepfakeBench framework throughout.

*Table 3.2: Software stack.*

| **Component**                 | **Version**                                  |
| ----------------------------- | -------------------------------------------- |
| Python                        | 3.10                                         |
| deep learning framework       | a current release with a matching CUDA build |
| numerical and image libraries | current stable releases                      |
| evaluation framework          | DeepfakeBench                                |

To keep the comparison fair, all models share one set of hyperparameters and differ only in the architecture.

*Table 3.3: Training hyperparameters shared across all models.*

| **Hyperparameter** | **Value**                                       |
| ------------------ | ----------------------------------------------- |
| backbone           | EfficientNet-B4, pretrained on ImageNet         |
| input resolution   | a fixed face crop                               |
| batch size         | 32                                              |
| frames per video   | 32                                              |
| optimizer          | Adam                                            |
| learning rate      | fixed                                           |
| training set       | FaceForensics++ at a moderate compression level |
| test set           | Celeb-DF-v2, cross-dataset                      |
| epochs             | 10                                              |
| seed               | a single fixed seed                             |

A note on cost: each full run consumes considerable rented-GPU time, so the results in this chapter come from a single seed, a limitation analysed in the discussion. The measured wall-clock training time is about five hours for the baseline and the base detector, and about one hour for each high-pass variant.

**Training and test datasets**

The character of the data decides what any claim about generalisation is worth. This thesis follows the cross-dataset protocol exactly: training entirely on FaceForensics++ and testing only on Celeb-DF-v2, which never appears in training. The split mirrors the real eKYC situation, where the model must face deepfake styles and faces it has never seen. FaceForensics++ provides 1000 real videos and four forgery methods generated from them, at a moderate compression level closer to real-world quality. Celeb-DF-v2 provides 590 real videos and several thousand high-quality deepfakes whose subtle artefacts make it a hard test of generalisation. A Vietnamese test set is part of the thesis scope as a test-only probe under the same pipeline; its collection is in progress, and its results are reported only once measured.

*Table 3.4: Statistics of the two datasets.*

| **Attribute**     | **FaceForensics++** | **Celeb-DF-v2**    |
| ----------------- | ------------------- | ------------------ |
| Role              | training            | cross-dataset test |
| Real videos       | 1000                | 590                |
| Fake videos       | 4000, four methods  | several thousand   |
| Real frames used  | about 31900         | 5620               |
| Fake frames used  | about 127700        | 10800              |
| Total frames used | about 159600        | 16420              |

**Class distribution**

Both datasets lean towards the fake class: the training set has about one real to four fake at the video level, and the test set is more strongly skewed. This skew matters for the choice of metric, because under such imbalance a model that always predicts fake still scores high accuracy. The thesis therefore adopts the area under the ROC curve at the frame level as the main metric, since it does not depend on the class ratio and measures the real-and-fake separability across all thresholds.

*Figure 3.1: Distribution of real and fake counts for the training and test sets.*

**Preprocessing consistency**

Every frame passes through the same pipeline: extract frames, detect and crop the face, resize to the fixed size, and normalise. The frequency branch additionally converts the crop to the brightness-and-colour space before the block-DCT. Keeping the pipeline identical across the two datasets stops the model from learning dataset-specific quirks such as differing crop conventions, and it is a precondition for any cross-dataset claim to be meaningful.

*Figure 3.2: A real and fake face pair after cropping, with the frequency spectrum, showing the frequency footprint of a deepfake.*

**Frequency-feature visualisation**

This connects directly to the core hypothesis. The frequency chart shows how energy and discriminability spread across the sixteen frequency bands, from low to high.

*Figure 3.3: Mean frequency energy by band for real and fake, with the difference; the mid and high bands carry the signal.*

In the mid and high bands, real faces consistently carry more energy than fakes, because deepfakes over-smooth the face and lose fine detail. There is, in other words, a discriminative signal in the frequency domain, which justifies the block-DCT branch. On the compressed data, however, the gap is small, since compression removes some of the high frequencies, and this is the main reason the frequency improvement is modest. It also motivates dropping the lowest bands, to avoid content leakage and concentrate on the mid band that carries the forgery signal.

### 3.1.2. EfficientNet-B4 baseline - design and training

The baseline is a plain EfficientNet-B4 classifier with a two-class head. It is the spatial-only reference that every frequency addition must beat, and it also serves as a correctness control: if a well-known backbone reproduces its known benchmark number under this harness, then any later improvement can be trusted rather than blamed on a misconfiguration. It is trained for ten epochs with the shared recipe and evaluated on the test set at the best checkpoint. An overview of the model after construction is shown below.

*Figure 3.4: Model summary of the baseline.*

*Figure 3.5: Training curve of the baseline - train loss and test accuracy per epoch, plotted directly from the log.*

Over ten epochs the train loss falls steadily and the test accuracy settles, with no sign of heavy overfitting. The baseline reaches a frame-level area under the curve of 0.7497, essentially matching the published benchmark value of 0.7487 for the same backbone, a difference of about 0.001. This match confirms the harness is set up correctly, which is the precondition for trusting every later number. The value 0.7497 is the spatial-only bar that the frequency variants must beat.

### 3.1.3. SFDCT - design and training

SFDCT adds the block-DCT frequency branch on top of the backbone and merges the two streams through the zero-start gated fusion described in Chapter 2. Because the gate starts closed, the model begins identical to the plain backbone, and the frequency branch can only add signal as the gate opens under training. This guarantees the floor property by design: attaching the branch cannot drag performance below the baseline at the outset. The variant is trained with the same recipe, so its curve begins from the same point as the baseline and diverges upward only once the frequency branch begins to contribute. An overview of the model after construction is shown below.

*Figure 3.6: Model summary of SFDCT.*

*Figure 3.7: Training curve of SFDCT, plotted directly from the log.*

The curves are plotted directly from the real logs; no numbers are simulated. The test accuracy rises and saturates, reaching 0.7572 at the best checkpoint, above the baseline floor as the zero-start design promises. No heavy overfitting appears within ten epochs. Because only a single seed is run, run-to-run variation is not yet quantified, a point returned to in the discussion.

### 3.1.4. SFDCT-HFF - design and training

The improved variant keeps the same backbone and the same zero-start gate but represents the frequency information as a high-pass image rather than per-band statistics, as described in Chapter 2: the low bands are zeroed, an inverse transform reconstructs a residual image in which the high-frequency traces dominate, a multi-scale convolutional stream processes it, and a residual-guided attention map points the backbone to the evidence. Two versions are trained, a minimal one without the multi-scale stream and attention, and a full one with both. An overview of the full model after construction is shown below.

*Figure 3.8: Model summary of SFDCT-HFF, full version.*

*Figure 3.9: Training curve of SFDCT-HFF, plotted directly from the log.*

The minimal version reaches a frame-level area under the curve of 0.7553 and the full version reaches 0.7695, the highest of the family and above both the baseline and the base detector. Because the variant reuses the same backbone, loss, and gate, this gain is attributable to the high-pass representation rather than to any other change. As with the base detector, the gain is read against the single-seed caveat and the confidence intervals reported next.

### 3.1.5. Comparative evaluation

This subsection answers the research question directly: whether adding frequency information helps cross-dataset generalisation, compared with a strong, already-tuned spatial backbone. The main metric is the frame-level area under the curve on the cross-dataset test set.

**Main comparison**

*Table 3.5: Cross-dataset comparison at the frame level. Training on FaceForensics++, testing on Celeb-DF-v2.*

| **Model**          | **best AUC** | **mean over the run** | **difference vs the baseline** |
| ------------------ | ------------ | --------------------- | ------------------------------ |
| baseline           | 0.7497       | 0.7082                | \-                             |
| SFDCT              | 0.7572       | 0.7140                | \+0.0075                       |
| SFDCT-HFF, minimal | 0.7553       | not recorded          | \+0.0056                       |
| SFDCT-HFF, full    | 0.7695       | 0.7236                | \+0.0198                       |

Two readings follow. Adding the block-DCT branch raises the cross-dataset score without degrading the baseline, so the floor property holds, which is the direction the hypothesis predicts. The high-pass representation raises it further, with the full variant the strongest of the family. The mean column sits well below the best column for every model, which is a reminder that selecting the best checkpoint on the test set is optimistic; this is why both numbers are reported rather than the best alone.

**Video-level evaluation**

When per-frame scores are averaged within a clip, the score rises for every model, because temporal aggregation averages out per-frame noise. From the best-checkpoint predictions, a video-level bootstrap, resampling the 518 test videos two thousand times, gives a confidence interval for each model and for its difference against the baseline.

*Table 3.6: Video-level area under the curve, with 95% confidence intervals and paired differences against the baseline on the same videos.*

| **Model**          | **video AUC** | **95% interval** | **paired difference vs the baseline** |
| ------------------ | ------------- | ---------------- | ------------------------------------- |
| baseline           | 0.8203        | \[0.781, 0.857\] | \-                                    |
| SFDCT              | 0.8083        | \[0.770, 0.847\] | \-0.012 \[-0.044, +0.021\]            |
| SFDCT-HFF, minimal | 0.8146        | \[0.774, 0.853\] | \-0.006 \[-0.038, +0.026\]            |
| SFDCT-HFF, full    | 0.8269        | \[0.788, 0.864\] | \+0.007 \[-0.022, +0.037\]            |

Every paired interval contains zero, so no variant separates from the baseline with statistical significance at the video level, and the full high-pass variant is the only one with a positive central difference. This is the honest reading: the direction is encouraging and the full variant is the best measured, but a single seed is not enough to call any gap significant, which motivates the multi-seed runs named in future work.

**ROC and precision-recall**

The ROC curve shows the trade-off between catching fakes and wrongly rejecting genuine users across all thresholds; the precision-recall curve suits the imbalanced test set. The decisive region for eKYC is where the false-positive rate is low.

*Figure 3.10: ROC curves on the test set; the marked line is the 5 percent false-positive constraint.*

*Figure 3.11: Precision-recall curves on the test set.*

In the low-false-positive region, the measured operating points show the base detector catching about 23 percent of fakes and the baseline slightly less, at the frame level. Aggregating to the video level lifts this to about a third, and relaxing to a wider review band reaches about half for the strongest variant. Even so, at a 5 percent false-positive budget the best frame-level model catches only about a quarter of deepfakes. This low recall is systemic across the whole family, not a defect of one variant, and it confirms that cross-dataset detection is hard and that extra signals, namely the liveness check, video-level aggregation, and a human-review band, are needed at a real operating threshold.

**Confusion matrix**

At the eKYC threshold, the errors split into genuine customers wrongly rejected and fakes that slip through, two error types with very different business consequences.

*Figure 3.12: Confusion matrix of the base detector at the eKYC threshold.*

At the threshold that holds the false-positive rate at 5 percent, the counts are 5339 genuine accepted, 281 genuine wrongly rejected, 8318 fakes missed, and 2482 fakes caught. The dominant error is missed fakes, about 77 percent of them, while wrongly rejected genuine users stay at about 5 percent, exactly as the constraint demands. At a genuine-customer-friendly operating point, then, the model misses most fakes and belongs as a screening layer rather than a standalone gate.

**Feature space and explainability**

A two-dimensional projection of the pre-classifier features shows the real and fake clusters still overlapping considerably, consistent with a score around 0.76 and far from full separation; adding the frequency branch makes the boundary slightly cleaner, matching the modest gain.

*Figure 3.13: Two-dimensional projection of the features, coloured by the real and fake label.*

The heat map shows where the model looks. It focuses on the face and the splice boundary, where forgery artefacts are most likely, rather than on the background, which meets the explainability requirement for eKYC. A set of example test predictions, the input face together with its predicted probability and the heat map overlay, makes the behaviour concrete.

*Figure 3.14: Heat map of the detector on a test sample; the hot regions are where the decision is made.*

*Figure 3.15: Example predictions on test faces, each with its predicted probability and verdict against the true label.*

**The fusion gate**

The gate starts closed, so any opening after training is direct proof that the model learned to use the frequency branch.

*Figure 3.16: Distribution of the gate values after training.*

After training, the gate opens selectively and modestly: most channels stay near zero, with only a small fraction opening appreciably and a small peak value. This agrees with the gain being small, and it shows the gate acting as a meter of the frequency contribution, opening only where the branch genuinely lowers the loss, and only by a little.

### 3.1.6. Decision threshold for the eKYC operating point

The area under the curve is independent of any threshold, but a deployed system needs a concrete one. Circular 17/2024/TT-NHNN mandates biometric verification qualitatively and prescribes no numeric error rate, so to turn that into a measurable operating point this thesis adopts a false-positive rate of at most 5 percent, following an international standard, so that the rate of genuine customers wrongly rejected stays low. The 5 percent is therefore an engineering choice made here, not a regulatory mandate. The threshold is calibrated so the measured false-positive rate stays within the budget, and the corresponding catch rate is reported at that fixed threshold.

*Table 3.7: Threshold calibration for the eKYC operating point, on the base detector.*

| **Quantity**                     | **Value**         |
| -------------------------------- | ----------------- |
| threshold                        | 0.9514            |
| target false-positive rate       | at most 5 percent |
| measured false-positive rate     | 0.0500            |
| catch rate at the threshold      | 0.2298            |
| accuracy and F1 at the threshold | 0.476 and 0.366   |

One caveat on calibration: the threshold is set on the test scores directly, because a separate validation split has not yet been carved out, so in real deployment it must be calibrated on data from the deployment distribution, namely Vietnamese faces. At this threshold, about 5 percent of genuine customers are wrongly rejected while only about 23 percent of deepfakes are caught, the inevitable consequence of a cross-dataset score around 0.76. At a tight, customer-friendly security level, usability is good but many fakes are missed, whereas a level that caught all fakes would reject too many genuine customers. The detector is therefore sufficient as a first screening layer, reducing the load on the next step, but not yet sufficient to stand alone; it must be combined with the liveness check and with video-level aggregation, whose score is higher than the frame-level one.

### 3.1.7. Discussion of the deepfake task

The block-DCT branch lifts the cross-dataset score by a small margin and, thanks to the zero-start gate, never drops below the baseline floor; the high-pass variant lifts it further and is the best measured. Directionally this supports the hypothesis, that forgery artefacts are weak in pixels but louder in the mid and high frequency bands, so frequency information complements rather than duplicates the spatial features. But the magnitude is small, and the video-level paired intervals all contain zero, so the gains should be read as encouraging and safe rather than significant. The positive learned gate, the slightly cleaner feature projection, and the higher catch rate at a low false-positive budget all point the same way: the frequency branch contributes a real if modest signal, strongest where compression has not erased the high bands.

It must be stated plainly that the method does not set a new state of the art. Published frequency methods reach comparable cross-dataset scores on the same protocol, and although the full high-pass variant edges them at the frame level on this single seed, the paired interval contains zero, so no claim of a leaderboard win is made. The contribution is, first, a risk-safe fusion design with a floor guarantee; second, an improved high-pass variant that is the best measured member of the family; and third, a fair cross-dataset evaluation following a standard framework.

*Table 3.8: Comparison with the baseline and other frequency methods on the cross-dataset test.*

| **Method**                        | **Group**             | **frame AUC** | **Source**    |
| --------------------------------- | --------------------- | ------------- | ------------- |
| EfficientNet-B4                   | spatial               | 0.7487        | the benchmark |
| EfficientNet-B4, this thesis      | spatial               | 0.7497        | this thesis   |
| a phase-based frequency method    | frequency             | 0.7650        | the benchmark |
| a residual-based frequency method | frequency             | 0.7552        | the benchmark |
| SFDCT, this thesis                | spatial and frequency | 0.7572        | this thesis   |
| SFDCT-HFF, full, this thesis      | spatial and frequency | 0.7695        | this thesis   |

**Limitations.** Three limitations apply. All numbers come from a single seed, so the small gaps may lie within seed noise; a firm ranking needs at least three seeds with mean and standard deviation, and the video-level intervals, all containing zero, formalise this. The cross-dataset evaluation uses one test set; a second cross-dataset set and the Vietnamese test set are future work, and the in-dataset half of the grid remains an open item. The strongest known data-side technique, a self-blending training strategy, is outside the current scope and is left to future work.

**Engineering practice.** Two working disciplines shaped where the limited budget went. Every configuration first passed a three-step local check, a shape check, a dry-run loop, and an overfit-one-batch test, before any rented-GPU time was committed, so no full run ever failed for a reason the check could have caught. And before spending on a deeper re-architecture of the frequency branch, a cheap processor-only probe on the frozen frequency features showed a near-chance cross-dataset signal, which argued against further spend in that direction, so the budget was redirected into the robustness analysis and the liveness module. This was an evidence-driven stop decision rather than an assumption.

### 3.1.8. Conclusion of the deepfake task

Under the standard cross-dataset protocol, three results are confirmed. The pipeline is correct, since the baseline reaches 0.7497, matching the benchmark value. Adding the block-DCT branch with the zero-start gate raises the cross-dataset score to 0.7572 without degrading the baseline, and the high-pass variant raises it to 0.7695, the best of the family, both within the single-seed noise band, which fulfils the floor property and supports the hypothesis. At the eKYC operating point the model recovers only about a quarter of fakes, so it is best deployed as a screening signal with an explainable heat map rather than as a standalone gate. The open items, a second seed set, the in-dataset half of the grid, and a second cross-dataset set, are listed in the limitations rather than estimated.

### 3.1.9. The liveness task (secondary)

Liveness detection, the detection of presentation attacks such as printed photos and screen replays, is the secondary module of the thesis. Its purpose in the eKYC pipeline is to sit as a cascade pre-filter ahead of deepfake detection: cheap spoofs are rejected first, and only live-looking faces proceed to the deepfake stage. The module deliberately reuses the SFDCT machinery, comparing the spatial baseline against the spatial-plus-frequency variant on this task, so the same design is tested in a second domain at almost no extra engineering cost. Both variants are trained and evaluated on a public anti-spoofing dataset, and every number below is a measured result, independently re-verified as described at the end.

**Data collection and preprocessing**

The dataset is LCC-FASD with its official three-way split into training, development, and evaluation. The faces use the same fixed-size, normalised input convention as the deepfake task, which is the whole point of the reuse, since the same crops can feed either head. The decision threshold is fixed at the equal-error point of the development split and is never tuned on the evaluation split.

*Table 3.9: The liveness dataset and its official split.*

| **Split**   | **Live** | **Spoof** | **Total** |
| ----------- | -------- | --------- | --------- |
| training    | 1223     | 7076      | 8299      |
| development | 405      | 2543      | 2948      |
| evaluation  | 314      | 7266      | 7580      |

*Figure 3.17: Example live and spoof faces from the dataset after the same cropping as the deepfake task.*

Both classifiers decide live against spoof and are trained with the binary cross-entropy under the shared recipe. They are evaluated by the standard anti-spoofing metrics at the fixed threshold: the attack-acceptance rate, the genuine-rejection rate, their average, and the area under the curve.

**B4-liveness - design and training**

The baseline is EfficientNet-B4 used as a spatial-only feature extractor with a small binary head, the most common deep anti-spoofing model. An overview of the model after construction is shown below.

*Figure 3.18: Model summary of B4-liveness.*

**Model structure**

  - > Input: the same fixed-size face crop as the deepfake pipeline.

  - > Backbone: EfficientNet-B4, extracting spatial and textural features.

  - > Head: a two-layer classifier on top of the backbone features.

  - > Output: a spoof probability and a live-or-spoof verdict.

**Training configuration**

  - > Loss: binary cross-entropy over live and spoof.

  - > Metric: the area under the curve, with the attack-acceptance and genuine-rejection rates at the fixed threshold.

  - > The shared recipe of the deepfake task, fine-tuned from the pretrained backbone.

*Figure 3.19: Training curve of B4-liveness, plotted directly from the log.*

**Best metrics achieved**

  - > Area under the curve: 0.9829.

  - > Average error rate: 6.85 percent.

  - > Attack-acceptance rate: 2.86 percent.

  - > Genuine-rejection rate: 10.83 percent.

*Figure 3.20: ROC curve and the live-against-spoof score distribution of B4-liveness on the evaluation split.*

An area under the curve near 0.98 exceeds published light-network baselines on this dataset, which report about 0.92 with an average error rate around 16 percent, so the result was deliberately stress-tested before being reported. The split loader uses the official folders and asserts that training and test never overlap; the evaluation count matches the official split exactly; and re-running the inference reproduced the same number to four decimal places. The verification is frozen as a one-command script, so any examiner can repeat it.

**B4+DCT-liveness - design and training**

The proposal reuses the spatial-plus-frequency design of the deepfake detector, adding the same block-DCT branch and the same zero-start gated fusion, with a binary head. An overview of the model after construction is shown below.

*Figure 3.21: Model summary of B4+DCT-liveness.*

**Model structure**

  - > Input: the same fixed-size face crop.

  - > Spatial branch: EfficientNet-B4, as in the baseline.

  - > Frequency branch: the same block-DCT branch from the deepfake design.

  - > Fusion: the same gated cross-attention with the gate starting closed, so the model begins equal to the baseline.

  - > Output: a spoof probability and a verdict.

**Training configuration**

  - > Loss: binary cross-entropy over live and spoof.

  - > Metric: the same as the baseline.

  - > The shared recipe, identical to the baseline so any difference comes from the frequency branch.

*Figure 3.22: Training curve of B4+DCT-liveness, plotted directly from the log.*

**Best metrics achieved**

  - > Area under the curve: 0.9776.

  - > Average error rate: 7.54 percent.

  - > Attack-acceptance rate: 4.25 percent.

  - > Genuine-rejection rate: 10.83 percent.

*Figure 3.23: ROC curve and the score distribution of B4+DCT-liveness on the evaluation split.*

The frequency branch does not improve the result here. Its area under the curve is slightly lower than the baseline, a difference of about 0.005, which is within noise given that the evaluation split has only 314 genuine images. This is consistent with the deepfake-side finding that the block-DCT branch adds no statistically separable gain.

**Conclusion of the liveness task**

*Table 3.10: Comparison of the two liveness models on the evaluation split.*

| **Model**       | **AUC** | **attack-acceptance** | **genuine-rejection** | **average error** |
| --------------- | ------- | --------------------- | --------------------- | ----------------- |
| B4-liveness     | 0.9829  | 2.86 percent          | 10.83 percent         | 6.85 percent      |
| B4+DCT-liveness | 0.9776  | 4.25 percent          | 10.83 percent         | 7.54 percent      |

The measured baseline reaches an average error rate of 6.85 percent and an area under the curve of 0.9829, clearly surpassing the targets recorded before training of about 16 percent and 0.92. The frequency branch does not help on this task, mirroring the deepfake result, which is reported honestly rather than hidden. One caveat remains: this is a within-dataset evaluation, with training and test both drawn from the same dataset, so cross-dataset evaluation is future work. The model is served as a separate microservice mirroring the deepfake service; wiring it into the eKYC cascade as a learned scorer, in place of the interim challenge check, remains an integration task.

## 3.2. Implementing the system

The preceding section validated the detector as a research artefact: a cross-dataset score around 0.76 on the test set, a calibrated decision threshold for the eKYC operating point, and a full set of explainability visualisations. This section describes how that artefact is wrapped into a working, multi-tenant web application named DeepGuard, and how it is packaged and deployed end to end. The scope should be stated clearly: what follows is a demonstration deployment for the defence and manual testing, not a production-hardened banking installation. The model is treated as a signal layer, a risk score with an explanation, not as a standalone gate.

### 3.2.1. Technology stack

DeepGuard is organised as three cooperating tiers behind a single database, following a one-directional request flow from the frontend to the backend to the database, with the machine-learning inference delegated over the network to a separate model service. The backend never loads the model directly; it talks to the model only through network calls, which keeps the backend lightweight and lets the model scale or be replaced independently.

**Frontend**

  - > A modern web framework with React for the dashboard and the playground, styled with a utility CSS toolkit and a component library.

  - > Client-side state and form handling through small state and validation libraries.

**Backend**

  - > A Python web framework serving the API, with routing through a service and a repository layer and role-based access control.

  - > Two authentication layers that are never mixed: signed login tokens for the dashboard and API keys for external integration, with hashed passwords.

  - > Schema validation and configuration without hard-coded secrets.

**Storage**

  - > A relational database holding the tenants, users, API keys, detections, and audit logs, reached through an async database layer.

**Model serving**

  - > A separate model service that loads the trained detector and exposes a prediction endpoint, returning the fake probability, the verdict, and the heat map.

**Containerisation and distribution**

  - > All services are packaged with Docker and orchestrated together, and the checkpoint and dataset are distributed through a model hub.

### 3.2.2. Deployment environment

The whole system deploys onto a single cloud instance orchestrated with Docker. All four services, the frontend, the backend, the model service, and the database, run as containers on one host and share a private network. The backend reaches the database and the model service only over internal addresses, and only the reverse-proxy port is exposed publicly. This co-located topology is intentional for a demonstration: it is reproducible with a single command, it avoids multi-node cost, and it matches the scale of a defence demonstration.

A key decision is that inference runs on the processor, with no graphics card required at serving time. The served detector is about seventy megabytes, and on the processor it produces a verdict and a heat map in about one second per image, fast enough for an interactive review screen. Because no graphics card is needed, the cost driver is memory rather than compute, dominated by the deep learning runtime and the face detector inside the model service alongside the database and the frontend. The recommended instance is therefore a mid-range one with two cores and eight gigabytes of memory, chosen so all four services stay resident.

*Table 3.11: Instance specification for the demonstration deployment.*

| **Item**  | **Specification**                  |
| --------- | ---------------------------------- |
| instance  | a mid-range cloud instance         |
| cores     | 2                                  |
| memory    | 8 gigabytes                        |
| inference | on the processor, no graphics card |
| role      | hosts all four containers          |

flowchart TB

user\["End user, browser, over HTTPS"\]

ext\["External eKYC backend, with an API key"\]

subgraph host\["Cloud instance, processor-only inference"\]

proxy\["Reverse proxy with HTTPS"\]

subgraph net\["Docker, private network"\]

fe\["frontend"\]

be\["backend"\]

sf\["model service, the detector and the face detector"\]

db\[("database")\]

end

end

user --\>|HTTPS| proxy

ext --\>|HTTPS| proxy

proxy --\> fe

proxy --\> be

fe --\>|requests| be

be --\>|database access| db

be --\>|prediction request| sf

*Figure 3.24: Deployment of DeepGuard on a single cloud instance. A reverse proxy terminates HTTPS and forwards to the four containers on a private network; the backend reaches the database and the model service only over the internal network.*

### 3.2.3. Domain registration and DNS

Public access is provided through a registered domain name whose DNS record points to the fixed public address of the instance. A reverse proxy on the host terminates the secure connection and routes incoming traffic to the right container: dashboard requests go to the frontend, while requests under the API prefixes go to the backend. An automated certificate supplies the secure-connection material, so all browser traffic and all external integrations travel over a secure connection. The proxy is the only publicly bound port; the backend, the model service, and the database stay reachable only on the private network, which prevents direct exposure of the database and the model service.

Two limitations are stated here because they bear on a real deployment. Route guarding is currently done on the client with the login token stored in the browser; server-side route protection is not yet in place. The interactive API documentation is also left public for convenience. Both are acceptable for a demonstration but must be closed off before any production exposure.

### 3.2.4. System access

The deployed demonstration is reached over a secure connection at the public domain, and the interactive backend documentation is available alongside it. To make the role-based behaviour easy to demonstrate, the database is populated by a seed script that creates a demonstration tenant with one account per role, all sharing the same demonstration password.

*Table 3.12: Seeded demonstration accounts.*

| **Role**          | **Lands on**                        |
| ----------------- | ----------------------------------- |
| platform operator | the cross-tenant platform dashboard |
| administrator     | the tenant administration dashboard |
| developer         | the integration dashboard           |
| compliance        | the review dashboard                |
| viewer            | the read-only dashboard             |

For a quick walkthrough without extra setup, log in as the developer, open the playground, and upload a face image. The page returns the risk score, the verdict band with a decision hint, the heat map, and the frequency spectrum, the same explainability surface analysed earlier. External integration, where a customer backend calls the detection endpoint with an API key, is demonstrated separately from the developer's API-keys screen.

A final positioning note: this is a demonstration configuration, and the served model is the cross-dataset checkpoint whose score is around 0.76 on the test set. That figure is strong enough to act as a useful risk signal with a transparent explanation, but it is not a perfect gate. The application is therefore engineered so the model output is one input to a reviewable decision, through the verdict bands, an uncertain zone, compliance audit notes, and a human-review queue, rather than an automatic verdict that cannot be appealed.

## 3.3. Results (application screens)

This section walks through the application screens that put the results in front of a user, in the order a visitor meets them: the home screen, the deepfake-detection screen, and the liveness screen. The screenshots are captured from the running demonstration.

### 3.3.1. Home screen

When a user opens the application, the home screen presents the main capabilities, deepfake detection, the liveness check, the playground, and the multi-tenant dashboard, and offers a clear entry point to begin an analysis.

*Figure 3.25: Home screen of DeepGuard.*

### 3.3.2. Deepfake-detection screen

After choosing to analyse an image, the user reaches the deepfake-detection screen, the application's core result surface. A valid upload triggers the detection and the screen renders four explainability components together:

  - > the risk score, the model's probability converted to a zero-to-one-hundred score with a verdict band and a decision hint, so a reviewer sees a calibrated judgement rather than a raw probability;

  - > the heat map overlay, the suspicious regions the model relied on, supporting officer review and audit;

  - > the frequency spectrum, exposing the frequency footprint behind the verdict;

  - > the history, past detections for the tenant, so a reviewer can revisit and compare prior cases.

*Figure 3.26: Deepfake-detection result screen, with the risk score, verdict band, heat map, frequency spectrum, and history.*

### 3.3.3. Liveness screen

The liveness screen is the front end for the cascade pre-filter. A user submits a face capture; the liveness module returns a live-or-spoof verdict with a confidence score and, when a spoof is detected, the attack type. The screen and its verdict are implemented in the dashboard, and the model behind it is the trained module measured earlier; the final wiring of the trained scorer behind the cascade endpoint is tracked as an integration item in future work.

*Figure 3.27: Liveness-detection screen.*

## 3.4. Conclusion

Chapter 3 carried the method from design to measurement and into a running system. Under the standard cross-dataset protocol, the baseline reaches 0.7497, matching the benchmark; the block-DCT branch raises the score to 0.7572 without degrading the baseline, and the high-pass variant raises it to 0.7695, the best of the family, both within the single-seed noise band. At the eKYC operating point the model recovers only about a quarter of fakes, so it is an explainable screening signal rather than a standalone gate, and it is not state of the art. On the systems side, the checkpoint is wrapped into the DeepGuard web application, a four-container stack on a single cloud host running on the processor, with five seeded roles and a playground exposing the same explainability surface. The liveness module is measured and its cascade wiring is in progress; the open items, the in-dataset half of the grid, a second cross-dataset set, the Vietnamese test set, and multi-seed validation, form the premise for the conclusion chapter.

# 

# CONCLUSION

This thesis set out to build a deepfake detector for electronic Know-Your-Customer onboarding in banking, together with the groundwork for a complementary liveness layer. The detector had to generalise to manipulations it has never seen and explain its decisions, since an attacker will not reuse the training-set forgeries, so the cross-dataset score is the one that matters. The proposed method, SFDCT, fuses a block-DCT frequency branch with a convolutional backbone, and an improved variant, SFDCT-HFF, keeps the frequency information as a high-pass image. It is trained on FaceForensics++ and tested cross-dataset on Celeb-DF-v2 under the standard protocol, with the frame-level area under the curve as the main metric.

**Key achievements**

  - > A frequency branch built on the block-DCT runs in parallel with the spatial backbone and merges through a gate that starts closed, so the model begins identical to the baseline and the frequency branch only gains influence when it lowers the loss. This gives a performance floor, a useful property in banking, unlike a related model whose gate starts half open.

  - > Under the standard protocol the baseline reaches 0.7497, close to the published figure for the same backbone, so the pipeline is comparable and the gains are not measured against a weak baseline.

  - > The frequency branch raises the score to 0.7572 and the high-pass variant to 0.7695, the best of the family and the only one with a positive paired difference at the video level. The direction agrees with the two-domain hypothesis, but the margins sit inside the single-seed noise band and are not a state-of-the-art claim.

  - > For eKYC, the thesis calibrates an operating point where the false-positive rate is at most 5 percent, following an international standard, an engineering choice made to satisfy the qualitative requirement of Circular 17/2024/TT-NHNN. At this customer-friendly point the detector still misses most deepfakes, so it fits as a first screening layer for review rather than the final decision.

  - > The system runs end to end, returning a fake probability, a verdict, and a heat map for each face, served on the processor with no graphics card, with explainability supporting both the reviewing officer and the audit obligations of eKYC.

**Limitations**

  - > EEvery number comes from a single run per configuration, so no significance is claimed; the video-level intervals all contain zero, confirming that no variant separates from the baseline at this seed.

  - > The improvement is modest and not state of the art; the strongest known data-side technique is outside scope and returned to below.

  - > Training and serving do not crop faces identically, which can shift the live operating point and should be fixed before production.

  - > Robustness was not tested systematically, including re-compression, noise, resolution changes, and adversarial perturbations.

  - > The liveness module is measured within one dataset only; cross-dataset behaviour is unchecked, and the cascade still uses an interim challenge check rather than the trained scorer.

  - > No Vietnamese-face evaluation exists yet; the set is specified as a test-only probe, with collection in progress, and no number is reported before it is measured.

  - > The in-dataset half of the grid and a second cross-dataset set remain open items.

**Future directions**

  - > Wire the measured liveness layer into the cascade, fusing its learned score with the deepfake risk score, and test it on a replay-heavy set.

  - > Run each configuration over several seeds with a paired significance test, to settle whether the frequency gain is genuine.

  - > Build the test-only Vietnamese-face set and measure generalisation to the real eKYC population.

  - > Widen the cross-dataset evaluation to sets covering more manipulation types and capture conditions.

  - > Integrate a self-blending training strategy, the strongest cross-dataset technique available, and combine it with the frequency branch.

  - > Harden the system: unify the training and serving crop, evaluate robustness, and apply quantisation, pruning, and distillation for edge and mobile use.

# REFERENCES

\[1\] M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proceedings of the 36th International Conference on Machine Learning (ICML)*, 2019, pp. 6105–6114.

\[2\] A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, and M. Nießner, "FaceForensics++: Learning to Detect Manipulated Facial Images," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019, pp. 1–11.

\[3\] Y. Li, X. Yang, P. Sun, H. Qi, and S. Lyu, "Celeb-DF: A Large-Scale Challenging Dataset for DeepFake Forensics," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 3207–3216.

\[4\] Z. Yan, Y. Zhang, X. Yuan, S. Lyu, and B. Wu, "DeepfakeBench: A Comprehensive Benchmark of Deepfake Detection," in *Advances in Neural Information Processing Systems (NeurIPS), Datasets and Benchmarks Track*, 2023.

\[5\] Z. Qin, P. Zhang, F. Wu, and X. Li, "FcaNet: Frequency Channel Attention Networks," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021, pp. 783–792.

\[6\] H. Liu, X. Li, W. Zhou, Y. Chen, Y. He, H. Xue, W. Zhang, and N. Yu, "Spatial-Phase Shallow Learning: Rethinking Face Forgery Detection in Frequency Domain," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 772–781.

\[7\] Y. Luo, Y. Zhang, J. Yan, and W. Liu, "Generalizing Face Forgery Detection with High-Frequency Features," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 16317–16326.

\[8\] Y. Qian, G. Yin, L. Sheng, Z. Chen, and J. Shao, "Thinking in Frequency: Face Forgery Detection by Mining Frequency-aware Clues," in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2020, pp. 86–103.

\[9\] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in *Proceedings of the IEEE International Conference on Computer Vision (ICCV)*, 2017, pp. 618–626.

\[10\] N. Ahmed, T. Natarajan, and K. R. Rao, "Discrete Cosine Transform," *IEEE Transactions on Computers*, vol. C-23, no. 1, pp. 90–93, 1974.

\[11\] J. Li, H. Xie, J. Li, Z. Wang, and Y. Zhang, "Frequency-aware Discriminative Feature Learning Supervised by Single-Center Loss for Face Forgery Detection," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021.

\[12\] H. Kashiani et al., "FreqDebias: Generalizable Deepfake Detection via Consistency-Driven Frequency Debiasing," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2025.

\[13\] International Organization for Standardization, *ISO/IEC 30107-3: Information technology - Biometric presentation attack detection - Part 3: Testing and reporting*, ISO/IEC, 2017.

\[14\] State Bank of Vietnam, *Circular 17/2024/TT-NHNN regulating the opening and use of payment accounts at payment-service providers*, Hanoi, 2024.

\[15\] B. Dolhansky, J. Bitton, B. Pflaum, J. Lu, R. Howes, M. Wang, and C. C. Ferrer, "The DeepFake Detection Challenge (DFDC) Dataset," arXiv:2006.07397, 2020.

\[16\] P. Kwon, J. You, G. Nam, S. Park, and G. Chae, "KoDF: A Large-scale Korean DeepFake Detection Dataset," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021.

\[17\] K. Zhang, Z. Zhang, Z. Li, and Y. Qiao, "Joint Face Detection and Alignment Using Multitask Cascaded Convolutional Networks," *IEEE Signal Processing Letters*, vol. 23, no. 10, pp. 1499–1503, 2016.

\[18\] K. Shiohara and T. Yamasaki, "Detecting Deepfakes with Self-Blended Images," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2022.

\[19\] C. Guo, G. Pleiss, Y. Sun, and K. Q. Weinberger, "On Calibration of Modern Neural Networks," in *Proceedings of the 34th International Conference on Machine Learning (ICML)*, 2017.

\[20\] B. Efron and R. J. Tibshirani, *An Introduction to the Bootstrap*. Chapman & Hall/CRC, 1994.

\[21\] T. Fawcett, "An Introduction to ROC Analysis," *Pattern Recognition Letters*, vol. 27, no. 8, pp. 861–874, 2006.

\[22\] L. van der Maaten and G. Hinton, "Visualizing Data using t-SNE," *Journal of Machine Learning Research*, vol. 9, pp. 2579–2605, 2008.

\[23\] I. Goodfellow, J. Pouget-Abadie, M. Mirza, B. Xu, D. Warde-Farley, S. Ozair, A. Courville, and Y. Bengio, "Generative Adversarial Nets," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2014.

\[24\] J. Hu, L. Shen, and G. Sun, "Squeeze-and-Excitation Networks," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2018, pp. 7132–7141.

\[25\] D. P. Kingma and J. Ba, "Adam: A Method for Stochastic Optimization," in *Proceedings of the 3rd International Conference on Learning Representations (ICLR)*, 2015.

\[26\] X. Tan, Y. Li, J. Liu, and L. Jiang, "Face Liveness Detection from a Single Image with Sparse Low Rank Bilinear Discriminative Model," in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2010.

\[27\] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, et al., "PyTorch: An Imperative Style, High-Performance Deep Learning Library," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2019.

\[28\] *LCC-FASD: Large Crowd-Collected Facial Anti-Spoofing Dataset*, public release. Accessed 2026.

\[29\] F. Chollet, "Xception: Deep Learning with Depthwise Separable Convolutions," in *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2017, pp. 1251–1258.

\[30\] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, "Attention Is All You Need," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017.

\[31\] T. Bachlechner, B. P. Majumder, H. H. Mao, G. W. Cottrell, and J. McAuley, "ReZero is All You Need: Fast Convergence at Large Depth," in *Proceedings of the 37th Conference on Uncertainty in Artificial Intelligence (UAI)*, 2021.

**Ghi chú về trình bày mỗi trang của đồ án**

  - Page layout: cỡ giấy A4; lề trái: 3cm, lề phải: 2cm, lề trên: 2,5cm, lề dưới: 2,5cm; header và footer: from edge: 1,6cm;

  - Đánh số trang: bắt đầu đánh số trang từ phần “MỞ ĐẦU”;

  - Tiêu đề chương, mục, tiểu mục: xem chi tiết như minh họa ở trên;

  - Mục Header: Tên đề tài (định dạng: font Time New Roman, Italic, size 10, căn lề: giữa);

  - Mục Footer: Sinh viên thực hiện, giảng viên hướng dẫn, đánh số trang (định dạng: font Time New Roman, size 10);

  - Chú dẫn table: nằm trên table, đánh số theo chương và số lũy tiến theo số thứ tự của table trong chương;

  - Chú dẫn hình: nằm dưới hình, đánh số theo chương và số lũy tiến theo số thứ tự của hình trong chương;

  - Đánh số công thức: bên phải công thức, đánh số theo chương và số lũy tiến theo số thứ tự của công thức trong chương;

  - Nên sử dụng các chức năng về Bookmark, Caption, Cross-Reference, Format Heading,… của Microsoft Word hoặc các phần mềm soạn thảo tương tự; cần tổ chức theo dạng “Long Document”.

**CONCLUSION {size 14**}

{Để 2 dòng trống}

Contentkết luận {Font: Time New Roman; thường; cỡ chữ: 13; dãn dòng: 1,3; căn lề: justified}

…………………………………………………………………………………………...

…………………………………………………………………………………………...

…………………………………………………………………………………………...

…………………………………………………………………………………………...

**Ghi chú về phần Kết luận**

  - > Phần Kết luận cần phải nêu được những kết luận chung, khẳng định những kết quả đạt được, những đóng góp, đề xuất và kiến nghị (nếu có);

  - > Trong phần này, có thể định dạng các điểm/ mục kết luận theo dạng Outline hoặc Numbering hoặc Bullets.

**REFERENCES**

{bold, size 14}

{Để 2 dòng trống}

{Font: Time New Roman; thường; cỡ chữ: 13; dãn dòng: 1,3; căn lề: justified}

**Ghi chú:**

Sinh viên xem “Quy định về liêm chính học thuật” ban hành kèm theo Quyết định số 29/QĐ-ĐHBK ngày 09/01/2017 và “Hướng dẫn trích dẫn và lập Danh mục tài liệu tham khảo” được ban hành theo văn bản số 30/HD-ĐHBK ngày 09/01/2017 để thực hiện trích dẫn và lập Danh mục tài liệu tham khảo.

**APPENDIX1**

{bold, size 14}

{Font: Time New Roman; thường; cỡ chữ: 12; dãn dòng: 1,3; căn lề: justified}

**APPENDIX 2**

{bold, size 14}

{Font: Time New Roman; thường; cỡ chữ: 12; dãn dòng: 1,3; căn lề: justified}
