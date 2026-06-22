# INTRODUCTION

## Background and Motivation

Electronic Know Your Customer (eKYC) has become a routine part of banking and finance in Vietnam. A customer can open an account, take out a loan, or confirm a payment from home, using only a portrait photo and a few taps on a phone. This convenience has turned eKYC into the first door through which many financial services are reached, and the face verification step is the lock on that door.

The same convenience makes the door attractive to attackers, and the threats arrive in two distinct forms. The first is the **deepfake**, in which generative models (typically generative adversarial networks (GANs) [23]) swap or synthesise a face, so that a counterfeit that looks real can be produced quickly and cheaply. The second is the presentation attack (also called a spoof or liveness attack), in which a printed photo or a screen replay is held in front of the camera to impersonate a genuine customer. If either attack slips past verification, the consequence is identity fraud and direct financial loss.

The regulatory context sharpens the problem. Circular 17/2024/TT-NHNN [14] of the State Bank of Vietnam requires banks to verify customers using biometric information, but it does not fix any exact error rate, which leaves the choice of operating threshold to the system designer. The technical context is harder still. Most current detectors learn directly from pixels: they perform well on data resembling their training distribution, yet often collapse when confronted with a forgery method or a dataset they have not seen before. This **generalisation gap** is the central difficulty of the task, because attackers in practice always reach for the newest tools, while the detector is frozen at the moment of training.

This thesis responds to that gap by protecting the face verification step against both threats. For deepfake detection, a face image is examined in two ways at once: the usual spatial view from pixels, and a frequency view computed on small image blocks, where the traces left by the generation process are easier to see [10]. For liveness detection, the system reads facial behaviour cues, such as eye state and head pose, to filter out printed photos and screen replays in line with presentation-attack-detection practice [13]. Both parts are wrapped in a web-based demo that also returns a heat-map image to explain each decision [9]. The result is intended to be a practical and explainable tool for the eKYC problem as it appears in Vietnamese banking.

## Problem Statement

The thesis treats deepfake detection and liveness detection as two protection layers over the same face verification step. The deepfake layer is the primary contribution. The liveness layer is a secondary, complementary utility. The problem can be framed by its inputs, its outputs, and the tasks that connect them.

### Input

A single face image captured or uploaded during an eKYC session. The image is cropped and aligned to a fixed size by the face-detection front end before it reaches the detector, so the system operates at frame level on still faces rather than on raw video.

### Output

For the deepfake layer, a real-versus-fake decision together with a continuous risk score and an accompanying heat-map image that explains which regions drove the decision. For the liveness layer, a live-versus-spoof decision based on facial behaviour cues.

### Main Tasks

- Detect whether an uploaded face image is genuine or a deepfake, with an explanation heat map attached to each decision.
- Detect whether the face in front of the camera belongs to a live person or to a printed photo or screen replay.
- Generalise to forgery methods unseen during training, which is the realistic operating condition for an eKYC deployment.
- Deliver these checks through a web platform that responds quickly and remains available in deployment.

## Project Objectives

The overarching purpose is a face verification protection system that covers both deepfake and liveness detection, evaluated honestly rather than only on data similar to the training set. Four concrete objectives follow from the source goals.

- Functional web platform. Build a simple and intuitive interface that lets a user upload or capture a face image and receive the analysis result quickly.
- Deepfake detection. Apply deep learning together with frequency analysis to decide whether an uploaded face image is real or fake, returning a heat-map image that explains each decision. The central new element is the combination of a frequency branch (built on the discrete cosine transform of small image blocks) with a standard convolutional backbone through a gated attention mechanism. The measured results are reported in Chapter 4.
- Liveness detection. Provide an additional utility that checks whether the face in front of the camera is a live person or a printed photo or screen replay.
- Cloud deployment. Keep the platform available by deploying the backend services on AWS EC2 and supporting cloud services.

## Research Scope

The work is deliberately bounded so its claims stay defensible, and two boundaries matter most: the deepfake detector works at frame level on aligned faces with no temporal information, and the liveness module is a secondary layer rather than the primary contribution.

- Detection granularity. In scope is a single aligned face image at frame level, while temporal or video-level fusion across frames is out of scope.
- Threat coverage. In scope are deepfakes, both face swap and synthesis, and presentation attacks such as print and replay, while physical 3D masks, audio deepfakes, and injection attacks that bypass the camera are out of scope.
- Evaluation protocol. In scope is the DeepfakeBench protocol [4], training on FaceForensics++ [2] and testing cross-dataset on Celeb-DF-v2 [3], while in-dataset-only reporting and proprietary benchmarks are out of scope.
- Liveness role. In scope is a secondary behaviour-cue utility on common presentation-attack cases, while a full standalone presentation-attack-detection (PAD) certification study is out of scope.
- Deployment. In scope is a web demo on AWS EC2 with storage and logging, while production-grade scaling and on-device mobile inference are out of scope.

## Research Methodology

The thesis followed a seven-step process from problem framing to documentation, ordered so that requirements and theory precede data and model work, and so that training stays separate from deployment, letting each be checked on its own.

- Idea development and requirements. Fix the scope of two protection layers for eKYC in Vietnamese banking and list the functional and non-functional demo requirements.
- Theory research and model exploration. Study deepfake generation and its frequency-domain traces, then choose a convolutional backbone [1] and a public benchmark framework [4].
- Data preparation. Extract, align, and crop faces from two public datasets to a fixed size under the benchmark configuration.
- Model building. Place a frequency branch beside the spatial backbone and join them with a gated attention module that starts closed.
- Training and evaluation. Train on one dataset and evaluate on a second unseen dataset, with the liveness module tested on presentation-attack cases and the results reported in Chapter 4.
- Demo development and cloud deployment. Build the web demo, with a modern frontend and a lightweight backend, and deploy it on AWS with storage and logging.
- Documentation. Produce this report.

## Structure of the Thesis

The Introduction sets out the context, purpose, and scope. The remaining chapters are organised as follows:

- Chapter 1 introduces the core theories and technologies: the problem domain, deep learning fundamentals, training and evaluation strategies, frequency-domain analysis, the liveness task, and the supporting web stack.
- Chapter 2 presents the proposed methodology: the dataset and preprocessing, the SFDCT detection model, and the liveness module.
- Chapter 3 covers the system analysis and design: use cases, sequence diagrams, and the database design.
- Chapter 4 reports the implementation, the experimental results, the deployment, and the application interface.
- The Conclusion states the problems solved, the issues left open, and recommendations for future work, followed by the References.
