# SFDCT — Method formulas

## A. Block-DCT frequency descriptor

The frequency branch turns a face crop into a compact, localised, normalised descriptor. The crop is divided into non-overlapping $8\times8$ blocks and the 2-D DCT is applied to each block independently, so a forgery trace stays localised and aligned with the JPEG quantisation grid.

**Log-magnitude transform (Eq. 2.1).** Each coefficient is rescaled to compress the dynamic range while avoiding the logarithm of zero:

$$D(u,v)=\log\left(1+\left|F(u,v)\right|\right)$$

The DCT is taken on YCbCr rather than RGB, since most frequency traces sit in the brightness channel $Y$ while the chroma channels $C_b, C_r$ carry complementary compression statistics.

**Band assignment (Eq. 2.2).** The $64$ coefficients of each block are ordered by increasing frequency along a zigzag path and grouped into $16$ bands. With the zigzag rank written as $\text{rank}$, a coefficient is assigned to a band by:

$$\text{band}(\text{rank})=\left\lfloor \text{rank}/4 \right\rfloor$$

so four consecutive ranks fall into each band.

**Per-band feature (Eq. 2.3).** The feature for band $b$ in channel $c$ is the mean magnitude of its coefficients:

$$g_{b,c}=\frac{1}{\left|\mathcal{B}_b\right|}\sum_{(u,v)\in\mathcal{B}_b}\left|F_c(u,v)\right|$$

where $\mathcal{B}_b$ is the set of coefficient positions in band $b$. Stacking $16$ bands across the three YCbCr channels yields a $48$-dimensional descriptor ($16 \times 3 = 48$).

## B. Gated cross-attention fusion

The two streams are merged by cross-attention in which the spatial features $F_s$ form the query and the frequency descriptor $D$ forms the key and value. Each spatial position queries which frequency traces are relevant in its region and retrieves a weighted summary, so the fusion is selective in space rather than a flat concatenation.

**Projections.** The query, key, and value are linear projections:

$$Q=W_q F_s,\qquad K=W_k D,\qquad V=W_v D$$

**Attended context (Eq. 2.4).** The attended context is:

$$\text{context}=\text{softmax}\left(\frac{Q K^{\top}}{\sqrt{d_k}}\right)V$$

where $d_k$ is the key dimension and the $\sqrt{d_k}$ factor keeps the softmax weights from saturating.

**Gated residual (Eq. 2.5).** The context enters the spatial stream through a gated residual connection whose scalar gate $\alpha$ is initialised to zero:

$$F_{\text{fused}}=F_s+\alpha\cdot\text{context},\qquad \alpha \text{ initialised to } 0$$

At the first step $\alpha=0$, so $F_{\text{fused}}=F_s$ and the model is exactly the backbone, which realises the floor guarantee of the zero-initialised gate. The gate then behaves as a learned strength control: if the frequency context reduces the training loss the gradient opens the gate, and if it is noisy or useless $\alpha$ is driven back towards zero. The learned value of $\alpha$ is therefore also a direct measurement of how much the frequency branch contributes.
