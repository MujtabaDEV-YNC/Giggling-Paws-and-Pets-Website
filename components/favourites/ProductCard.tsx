"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  // Touch screens have no hover, so a separate toggle previews the lifestyle shot.
  const [preview, setPreview] = useState(false);
  const { slug, name, description, price, url } = product;

  return (
    <article className={`product-card${preview ? " is-preview" : ""}`} data-pet={product.pet}>
      <div className="product-media">
        <img
          className="media-img media-storefront"
          src={`/products/storefront/${slug}.webp`}
          alt={`${name}, storefront photo`}
          width={640}
          height={640}
          loading="lazy"
          decoding="async"
        />
        <img
          className="media-img media-lifestyle"
          src={`/products/lifestyle/${slug}.webp`}
          alt={`${name} with a pet`}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
        />
        <button
          type="button"
          className="preview-toggle"
          aria-pressed={preview}
          onClick={() => setPreview((v) => !v)}
        >
          {preview ? "Show product" : "See it with a pet"}
        </button>
      </div>

      <div className="product-body">
        <p className="product-pet">For {product.pet}</p>
        <h3 className="product-name">
          <a href={url}>{name}</a>
        </h3>
        <p className="product-desc">{description}</p>
        <div className="product-foot">
          <span className="price">{price}</span>
          <a className="card-cta" href={url}>
            View product
            <span className="sr-only"> — {name}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
