# Probing the Misaligned Thinking Process of Language Models — Project Page

Source for the project page of **Probing the Misaligned Thinking Process of Language Models**.

We monitor misalignment by decomposing it into fine-grained cognitive processes —
**misalignment indicators** — and detecting their presence in a model's internal
activations with linear probes. The page covers the 18-indicator taxonomy, the
automated probe-training pipeline, a probe→LLM two-stage cascade, and the
out-of-distribution evaluation (probes reach **0.936** AUROC and the cascade **0.950**,
matching strong LLM judges at a fraction of the cost).

## Local preview

The site is fully static. Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Layout

```
github-page/
├── index.html                      # Main page
├── tasks.html                      # Indicator Browser (18 indicators)
├── assets/icons/                   # arXiv, GitHub icons
└── static/
    ├── images/figures/             # PNGs rendered from the paper figures
    │   ├── fig1.png                #   indicator taxonomy + example
    │   ├── fig2.png                #   four-stage probe pipeline
    │   ├── fig3.png                #   two failure modes
    │   ├── fig4.png                #   18- vs 5- vs 1-probe decomposition curve
    │   ├── fig5.png                #   three case studies
    │   └── cosine_matrix.png       #   probe-direction cosine similarity
    └── js/
        ├── indicator_data.js       # the 18-indicator taxonomy (definitions + examples)
        └── indicators.js           # Indicator Browser renderer
```

## Indicator Browser data

The Indicator Browser (`tasks.html`) is generated from `static/js/indicator_data.js`,
which mirrors the taxonomy table in the paper's appendix (one entry per indicator with
its behavioral group, precise definition, and example reasoning excerpts). Edit that file
to update the browser; no runtime fetch or build step is required.

## Citation

```bibtex
@misc{zhou2026probing,
  title  = {Probing the Misaligned Thinking Process of Language Models},
  author = {Zhou, Kaiwen and Venhoff, Constantin and Michala, Jonathan
            and Wang, Xin Eric and Saunders, William},
  year   = {2026}
}
```

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
