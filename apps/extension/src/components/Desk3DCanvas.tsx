import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Desk3DCanvasProps {
  mouseX: number;
  mouseY: number;
  sensitivity?: number;
  enabled?: boolean;
}

export const Desk3DCanvas: React.FC<Desk3DCanvasProps> = ({
  mouseX,
  mouseY,
  sensitivity = 0.5,
  enabled = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const deskObjectsRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 25;
    cameraRef.current = camera;

    // WebGL Renderer with transparent background and alpha
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Subtle Ambient & Directional Lighting for Comic depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 0.9);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Group for desk elements
    const group = new THREE.Group();
    deskObjectsRef.current = group;
    scene.add(group);

    // 1. Origami 3D Paper Airplane floating at top right
    const planeGeo = new THREE.BufferGeometry();
    // Vertex positions for a 3D folded paper airplane
    const vertices = new Float32Array([
      // Left wing
      0, 0, 3,  -2.5, 0.5, -2,  0, 0.8, -1.8,
      // Right wing
      0, 0, 3,  0, 0.8, -1.8,   2.5, 0.5, -2,
      // Left fold down
      0, 0, 3,  0, -0.6, -1.8,  -2.5, 0.5, -2,
      // Right fold down
      0, 0, 3,  2.5, 0.5, -2,   0, -0.6, -1.8,
    ]);
    planeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    planeGeo.computeVertexNormals();

    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const paperPlane = new THREE.Mesh(planeGeo, planeMat);
    paperPlane.position.set(16, 8, 0);
    paperPlane.rotation.set(-0.2, -0.6, 0.3);
    paperPlane.scale.set(0.65, 0.65, 0.65);
    group.add(paperPlane);

    // 2. 3D Yellow Post-it Paper with curved corner
    const noteGeo = new THREE.PlaneGeometry(3.5, 3.5, 4, 4);
    const noteMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const sticky3d = new THREE.Mesh(noteGeo, noteMat);
    sticky3d.position.set(-17, -7, 0);
    sticky3d.rotation.set(0.1, 0.3, -0.15);
    group.add(sticky3d);

    // 3. 3D Pushpin on top of note
    const pinHeadGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.3,
      roughness: 0.2,
    });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
    pinHead.position.set(-17, -5.2, 0.4);
    group.add(pinHead);

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with gentle idle sway
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle float
      paperPlane.position.y = 8 + Math.sin(elapsedTime * 1.5) * 0.4;
      paperPlane.rotation.z = 0.3 + Math.cos(elapsedTime * 1.2) * 0.08;

      sticky3d.rotation.z = -0.15 + Math.sin(elapsedTime * 0.8) * 0.03;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      noteGeo.dispose();
      noteMat.dispose();
      pinHeadGeo.dispose();
      pinMat.dispose();
    };
  }, [enabled]);

  // Handle subtle mouse parallax on Three.js group
  useEffect(() => {
    if (!deskObjectsRef.current || !enabled) return;
    const targetRotX = mouseY * sensitivity * 0.15;
    const targetRotY = mouseX * sensitivity * 0.15;

    deskObjectsRef.current.rotation.x = targetRotX;
    deskObjectsRef.current.rotation.y = targetRotY;
  }, [mouseX, mouseY, sensitivity, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-1 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};
