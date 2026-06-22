# INTRODUCTION

## Problem Statement

In recent years, electronic Know Your Customer (eKYC) has become a normal part of banking and finance. A customer can open an account, take a loan, or confirm a payment from home, using only a portrait photo and a few taps on a phone. Because of this convenience, eKYC is now the first door into many financial services in Vietnam.

However, this door is also a target for attack. With deepfake techniques, which use GANs and other generative models to swap or create faces, a fake face that looks real can be made quickly and at low cost. If such a face passes the face verification step of eKYC, the result can be identity fraud, account takeover, and financial loss. In Vietnam, Circular 17/2024/TT-NHNN requires banks to verify customers with biometrics, but it does not give an exact error number. In addition, most current detectors are CNNs that learn directly from pixels. They work well on data similar to their training set, but they often fail when they meet a new forgery method or a new dataset. This is called the cross-dataset generalisation problem, and it is the hardest part of the task.

Recognizing this gap, this thesis aims to build a deepfake detection model that looks at a face image in two ways at the same time: the normal spatial view from pixels, and the frequency view based on block-wise DCT on 8×8 blocks, where deepfake traces are easier to see. The two views are joined by a gated cross-attention module whose gate starts from zero, so the combined model is never weaker than the spatial backbone alone. The model is wrapped in a web-based demo for the eKYC scenario, which shows a Grad-CAM image to explain each decision. The system also offers an additional liveness check feature, which helps detect printed photos or replay attacks in front of the camera.

This solution combines recent results in frequency analysis and deep learning, delivering a practical and explainable tool for the eKYC problem in Vietnam.

## Purposes

The purpose of this thesis is to develop a deepfake detector that generalises better to unseen forgery methods. This is the realistic situation in eKYC, where attackers always use the newest generation tools, which the model has never seen in training. The main new point of the method is the combination of a block-DCT frequency branch with the EfficientNet-B4 backbone through a zero-initialised gated cross-attention, together with the study of five frequency ideas from earlier works (SPSL, SRM, FreqDebias, FcaNet, FDFL) inside one common framework.

At the same time, the thesis aims to stay honest and practical. All models are trained and tested under the public DeepfakeBench protocol, so the comparison with the baseline is fair. The decision threshold of the demo is set at the operating point FPR ≤ 5% following ISO/IEC 30107-3. This number is our own engineering choice to meet the qualitative requirement of Circular 17/2024/TT-NHNN, which itself does not fix any threshold.

## Objectives

Build the SFDCT model: combine the EfficientNet-B4 backbone with a frequency branch based on block-wise DCT (8×8 blocks, 16 zigzag bands), fused by a zero-initialised gated cross-attention, so that the model has a performance floor at least equal to B4.

Adapt five frequency levers: bring five ideas from earlier frequency works (SPSL, SRM, FreqDebias, FcaNet, FDFL) into the same block-DCT domain and test which of them really helps and which does not.

Evaluate fairly across datasets: train on FaceForensics++ (c23) and test on Celeb-DF-v2 under the DeepfakeBench protocol, through the ablation chain B4 → B4-DCT → Row1 → Row2, with bootstrap confidence intervals to check whether a difference is real or only noise.

Build an explainable eKYC demo: a web system where the user uploads a face image and receives a risk score, a real or fake label, and a Grad-CAM image; the decision threshold is calibrated at FPR ≤ 5%. A liveness check module is included as a secondary feature, trained and evaluated within-dataset (see Section 3.1.8).

The thesis works at frame level on single face images and does not use temporal information across video frames.

## Implementation process

Step 1: Idea Development and Requirements Definition

We started by defining the scope of the thesis: deepfake detection is the main task, the liveness check is a secondary module, and the target scenario is eKYC in Vietnamese banking. The functional and non-functional requirements of the demo system were also listed at this stage.

Step 2: Theory Research and Model Exploration

To lay a solid foundation, we first studied how deepfakes are generated and why the generation process leaves traces in the frequency domain. We then read the related works on frequency-based detection, chose EfficientNet-B4 as the spatial backbone, and chose DeepfakeBench as the training and evaluation framework.

Step 3: Data Preparation

Faces were extracted from FaceForensics++ and Celeb-DF-v2 videos, aligned and cropped into 256×256 face images, and described by JSON files following the DeepfakeBench configuration.

Step 4: Model Building

The SFDCT model was built: a block-DCT frequency branch placed next to the B4 backbone, joined by the zero-initialised gated cross-attention, with the five frequency levers as optional parts that can be turned on and off for the ablation study.

Step 5: Training and Evaluation

The models were trained on FaceForensics++ (c23) and evaluated cross-dataset on Celeb-DF-v2 with frame-level AUC, using the DeepfakeBench default configuration. The details of the training setup and the results are given in Chapter 3.

Step 6: Demo Development and Cloud Deployment

A web demo was built with a Next.js frontend and a FastAPI backend. The system was deployed on AWS EC2, together with S3 for storing evidence images and CloudWatch for tracking logs, so the demo can be monitored in real time.

Step 7: Documentation

The final stage was writing this report, which presents the goals, the technical approach, the implementation, and the results of the thesis.

## Structure of the thesis

INTRODUCTION - This chapter gives information about the context and purpose of the thesis, as well as the scope of the problems which will be focused on in the thesis.

Chapter 1: THEORIES AND TECHNOLOGIES - This chapter introduces the core theories and technologies used in the thesis, including the web stack, deep learning fundamentals, the DCT and frequency analysis, and an overview of deepfake generation and detection.

Chapter 2: SYSTEM ANALYSIS AND DESIGN - This chapter describes the system requirements, the design of the SFDCT model, and the architectural design of the demo application.

Chapter 3: SYSTEM IMPLEMENTATION AND EVALUATION - This chapter details the implementation of the system and its model components, along with the experimental results, their statistics, and the performance evaluation.

CONCLUSION - The concluding section emphasizes the problems solved, presents the issues still unresolved, and provides recommendations and suggestions for future work.

REFERENCES - Presentation of the details of the referenced materials used in this thesis.
