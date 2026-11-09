/**
 * Liquid Metal Button, by johuniq on 21st.dev
 * (https://21st.dev/@johuniq/components/liquid-metal-button), converted from TSX to JSX.
 *
 * Hestola changes (look and motion otherwise match the original):
 * - `width` prop (default 142, the original) so longer labels fit; the layers follow it.
 * - `className` on the outer wrapper, for positioning.
 * - Visible keyboard focus ring (the original removed the outline).
 * - Label colour lifted from #666 to #9a9a9a for readable contrast on the black face.
 * - Under prefers-reduced-motion the metal is drawn still (shader speed 0) and the click
 *   ripple is skipped.
 * - `theme` prop to restyle it without touching the motion (omit it for the original look):
 *   { tint: [r, g, b, a] metal tint 0-1, face: CSS background of the face, label: label
 *   colour, labelShadow, font: style object for the label, fill: colour that rises from the
 *   bottom on hover/keyboard focus, fillLabel: label colour over the fill }.
 *
 * Props: label = "Get Started", onClick, viewMode = "text" | "icon", width, className, theme.
 * Needs the `@paper-design/shaders` package (WebGL).
 */
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SPEED_IDLE = 0.6;
const SPEED_HOVER = 1;
const SPEED_CLICK = 2.4;
const ORIGINAL = {
  face: "linear-gradient(180deg, #202020 0%, #000000 100%)",
  label: "#9a9a9a",
  labelShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)",
};
const FILL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function LiquidMetalButton({ label = "Get Started", onClick, viewMode = "text", width = 142, className, theme }) {
  const look = { ...ORIGINAL, ...theme };
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const filled = Boolean(look.fill) && (isHovered || isFocused);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const shaderRef = useRef(null);
  const shaderMount = useRef(null);
  const buttonRef = useRef(null);
  const rippleId = useRef(0);
  const [still] = useState(prefersReducedMotion);
  const tintRef = useRef(theme?.tint);

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return { width: 46, height: 46, innerWidth: 42, innerHeight: 42, shaderWidth: 46, shaderHeight: 46 };
    }
    return { width, height: 46, innerWidth: width - 4, innerHeight: 42, shaderWidth: width, shaderHeight: 46 };
  }, [viewMode, width]);

  const setSpeed = (speed) => shaderMount.current?.setSpeed?.(still ? 0 : speed);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    try {
      if (shaderRef.current) {
        if (shaderMount.current?.destroy) {
          shaderMount.current.destroy();
        }

        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
            ...(tintRef.current ? { u_colorTint: tintRef.current } : {}),
          },
          undefined,
          still ? 0 : SPEED_IDLE,
        );
      }
    } catch (error) {
      console.error("Failed to load the liquid metal shader:", error);
    }

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, [still]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setSpeed(SPEED_HOVER);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    setSpeed(SPEED_IDLE);
  };

  const handleClick = (e) => {
    setSpeed(SPEED_CLICK);
    setTimeout(() => {
      setSpeed(isHovered ? SPEED_HOVER : SPEED_IDLE);
    }, 300);

    if (buttonRef.current && !still) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Keyboard clicks have no pointer position: ripple from the centre.
      const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
      const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.();
  };

  const layer = {
    position: "absolute",
    top: 0,
    left: 0,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transformStyle: "preserve-3d",
    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
  };
  const pressed = isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)";

  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
          }}
        >
          <div
            style={{
              ...layer,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" && (
              <Sparkles
                size={16}
                style={{
                  color: filled && look.fillLabel ? look.fillLabel : look.label,
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5))",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                }}
              />
            )}
            {viewMode === "text" && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  ...look.font,
                  color: filled && look.fillLabel ? look.fillLabel : look.label,
                  textShadow: look.labelShadow,
                  transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.5s ${FILL_EASE}`,
                  transform: "scale(1)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            )}
          </div>

          <div style={{ ...layer, transform: `translateZ(10px) ${pressed}`, zIndex: 20 }}>
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                position: "relative",
                overflow: "hidden",
                background: look.face,
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                  : "none",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {look.fill && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: look.fill,
                    transform: filled ? "translateY(0)" : "translateY(101%)",
                    transition: still ? "none" : `transform 0.5s ${FILL_EASE}`,
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ ...layer, transform: `translateZ(0px) ${pressed}`, zIndex: 10 }}>
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)"
                    : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 36px 14px 0px rgba(0, 0, 0, 0.02), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onFocus={(e) => setIsFocused(e.currentTarget.matches(":focus-visible"))}
            onBlur={() => setIsFocused(false)}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3EEE3]"
            style={{
              ...layer,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 40,
              transform: "translateZ(25px)",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiquidMetalButton;
