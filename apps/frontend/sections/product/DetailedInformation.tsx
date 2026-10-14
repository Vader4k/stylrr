"use client";

import { Product } from "@/features/products/types/product.types";
import ColorPicker from "@/features/products/components/ColorPicker";
import SizePicker from "@/features/products/components/SizePicker";
import QuantityPicker from "@/features/products/components/QuantityPicker";
import { Star, X, Heart, Share } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SizeGuide from "./SizeGuide";
import { useAddToCart } from "@/features/cart/hooks/cart.hook";
import { useCurrency } from "@/features/currency/context/CurrencyContext";

const DetailedInformation = ({ product }: { product: Product }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const { formatPrice } = useCurrency();

  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const reset = () => {
    setSelectedColor(null);
    setSize(null);
  };

  const handleAddToCart = () => {
    const cartItem = {
      product: product._id,
      sku: product.sku,
      quantity: quantity,
      size: size,
      color: selectedColor,
    };
    addToCart(cartItem);
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    }
  };

  const hasColor = product.colors && product.colors.length > 0;
  const hasSize = product.inventory && product.inventory.length > 0;

  const handleIncreaseQuantity = () => {
    if (hasSize) {
      if (quantity < stock) {
        setQuantity(quantity + 1);
      }
    } else {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity === 1) return;
    setQuantity(quantity - 1);
  };

  const totalStock = hasSize ? product.inventory!.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const isOutOfStock = hasSize ? (size ? stock === 0 : totalStock === 0) : false;
  const isMaxReached = hasSize && size ? quantity >= stock : false;

  const isDisabled =
    (hasColor && !selectedColor) ||
    (hasSize && !size) ||
    (hasColor && hasSize && stock === 0);

  return (
    <div className="font-jost grid gap-4">
      <h1 className="text-2xl capitalize">{product.name}</h1>
      <div className="flex items-center gap-0.5 text-sm">
        {[...Array(5)].map((_, index) => (
          <Star key={index} size={11} fill="gold" stroke="gold" />
        ))}
        <span className="font-medium px-2">{product.reviews} reviews</span>
      </div>

      <div>
        {product.discountPrice && product.discountPrice < product.price ? (
          <div className="flex items-center gap-2">
            <p className="text-xl font-medium line-through text-gray-300">
              {formatPrice(product.price)}
            </p>
            <p className="text-xl font-medium">{formatPrice(product.discountPrice)}</p>
          </div>
        ) : (
          <p className="text-xl font-medium">{formatPrice(product.price)}</p>
        )}
      </div>

      <p className="text-sm">{product.shortDescription}</p>

      {hasColor && (
        <div className="mt-2">
          <ColorPicker
            colors={product.colors!}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>
      )}

      {hasSize && (
        <div>
          <SizePicker
            sizes={product.inventory!}
            setQuantity={setQuantity}
            selectedSize={size}
            setSize={setSize}
            setStock={setStock}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedColor && size && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => reset()}
            className="flex items-center gap-1 text-sm"
          >
            <X size={16} strokeWidth={3} />
            <p>Clear</p>
          </motion.button>
        )}
      </AnimatePresence>

      {isOutOfStock ? (
        <div className="w-full bg-gray-50/50 text-gray-500 border h-12 flex items-center justify-center text-sm font-medium cursor-not-allowed">
          Out of stock
        </div>
      ) : (
        <QuantityPicker
          quantity={quantity}
          decrease={handleDecreaseQuantity}
          increase={handleIncreaseQuantity}
          isDisabled={isDisabled!}
          addToCart={handleAddToCart}
          isAdding={isAdding}
          isMaxReached={isMaxReached}
        />
      )}

      <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 my-2">
        <SizeGuide />
        <button className="flex items-center gap-1 text-sm">
          <Heart size={16} strokeWidth={1} />
          <p>Add to wishlist</p>
        </button>
        <button
          onClick={() => shareProduct()}
          className="flex items-center gap-1 text-sm"
        >
          <Share size={16} strokeWidth={1} />
          <p>Share this Product</p>
        </button>
      </div>

      <div className="mt-3 pt-5 w-full border-t">
        <div className="text-sm grid gap-1.5">
          <p className="text-gray-400">
            SKU: <span className="text-black font-medium">{product.sku}</span>
          </p>
          <p className="capitalize text-gray-400">
            Category:{" "}
            <span className="capitalize text-black font-medium">
              {product.category?.map((tag) => tag.name).join(", ")}
            </span>
          </p>
          <p className="capitalize text-gray-400">
            Tags:{" "}
            <span className="text-black font-medium">
              {product.tags?.map((tag) => tag.name).join(", ")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedInformation;
