import React, { useEffect, useRef } from 'react';

export default function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    // Mouse coordinates (relative to window center)
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      px: 0, // absolute canvas x
      py: 0, // absolute canvas y
      active: false,
    };

    // Camera settings
    const camera = {
      x: 0,
      y: 0,
      z: 500,
      fov: 650, // focal length
      rotX: 0,
      rotY: 0,
      targetRotX: 0,
      targetRotY: 0,
    };

    // Resize handler
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left - width / 2;
      mouse.targetY = e.clientY - rect.top - height / 2;
      mouse.px = e.clientX - rect.left;
      mouse.py = e.clientY - rect.top;
      mouse.active = true;

      // Adjust camera target rotation based on cursor position
      camera.targetRotY = (mouse.targetX / (width / 2)) * 0.35; // Yaw
      camera.targetRotX = -(mouse.targetY / (height / 2)) * 0.35; // Pitch
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      mouse.active = false;
      camera.targetRotX = 0;
      camera.targetRotY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // ────────────────────────────────────────────────────────────────
    // 3D MATH HELPERS
    // ────────────────────────────────────────────────────────────────

    const rotateX = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y = point.y * cos - point.z * sin;
      const z = point.y * sin + point.z * cos;
      return { x: point.x, y, z };
    };

    const rotateY = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = point.x * cos + point.z * sin;
      const z = -point.x * sin + point.z * cos;
      return { x, y: point.y, z };
    };

    const rotateZ = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = point.x * cos - point.y * sin;
      const y = point.x * sin + point.y * cos;
      return { x, y, z: point.z };
    };

    // Project 3D point to 2D screen using canvas center
    const project = (point) => {
      const scale = camera.fov / (camera.fov + point.z + camera.z);
      return {
        x: point.x * scale + width / 2,
        y: point.y * scale + height / 2,
        scale,
        z: point.z,
      };
    };

    // ────────────────────────────────────────────────────────────────
    // OBJECT BUILDERS
    // ────────────────────────────────────────────────────────────────

    // 1. Interactive Plexus Nodes
    const NUM_NODES = 95;
    const nodes = [];
    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 900,
        y: (Math.random() - 0.5) * 900,
        z: (Math.random() - 0.5) * 900,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        vz: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.2,
        baseColor: i % 3 === 0 ? '99, 102, 241' : (i % 3 === 1 ? '139, 92, 246' : '6, 182, 212'), // indigo, purple, cyan
      });
    }

    // 2. Crystal Icosahedron Geometry
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawIcoVertices = [
      { x: -1, y: phi, z: 0 }, { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 }, { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi }, { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi }, { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 }, { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 }, { x: -phi, y: 0, z: 1 },
    ];

    const icoRadius = 145;
    const icoVertices = rawIcoVertices.map(v => {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return {
        x: (v.x / len) * icoRadius,
        y: (v.y / len) * icoRadius,
        z: (v.z / len) * icoRadius,
      };
    });

    const icoEdges = [];
    const distThreshold = icoRadius * 1.1;
    for (let i = 0; i < icoVertices.length; i++) {
      for (let j = i + 1; j < icoVertices.length; j++) {
        const dx = icoVertices[i].x - icoVertices[j].x;
        const dy = icoVertices[i].y - icoVertices[j].y;
        const dz = icoVertices[i].z - icoVertices[j].z;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < distThreshold) {
          icoEdges.push([i, j]);
        }
      }
    }

    const icoFaces = [];
    for (let i = 0; i < icoVertices.length; i++) {
      for (let j = i + 1; j < icoVertices.length; j++) {
        for (let k = j + 1; k < icoVertices.length; k++) {
          const hasIJ = icoEdges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
          const hasJK = icoEdges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
          const hasKI = icoEdges.some(e => (e[0] === k && e[1] === i) || (e[0] === i && e[1] === k));
          if (hasIJ && hasJK && hasKI) {
            icoFaces.push([i, j, k]);
          }
        }
      }
    }

    // 3. Nested Outer Gyroscope Rings (2 concentric orthogonal circles)
    const RING_POINTS = 32;
    const ring1Vertices = [];
    const ring2Vertices = [];
    const ringRadius = icoRadius * 1.35;

    for (let i = 0; i < RING_POINTS; i++) {
      const theta = (i / RING_POINTS) * Math.PI * 2;
      ring1Vertices.push({
        x: Math.cos(theta) * ringRadius,
        y: Math.sin(theta) * ringRadius,
        z: 0
      });
      ring2Vertices.push({
        x: 0,
        y: Math.cos(theta) * ringRadius,
        z: Math.sin(theta) * ringRadius
      });
    }

    // Geometry rotation variables
    let geomRotX = 0;
    let geomRotY = 0;
    let geomRotZ = 0;

    // ────────────────────────────────────────────────────────────────
    // RENDER LOOP
    // ────────────────────────────────────────────────────────────────

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera orientation transition (LERP)
      camera.rotX += (camera.targetRotX - camera.rotX) * 0.05;
      camera.rotY += (camera.targetRotY - camera.rotY) * 0.05;

      // Update self rotation of the crystal system
      geomRotX += 0.0015;
      geomRotY += 0.0025;
      geomRotZ += 0.001;

      // Draw subtle dynamic lighting halo behind everything
      const haloX = width / 2 + mouse.x * 0.2;
      const haloY = height / 2 + mouse.y * 0.2;
      const lightHalo = ctx.createRadialGradient(
        haloX, haloY, 50,
        haloX, haloY, Math.max(width, height) * 0.6
      );
      lightHalo.addColorStop(0, 'rgba(30, 27, 75, 0.22)');
      lightHalo.addColorStop(0.5, 'rgba(8, 47, 73, 0.06)');
      lightHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightHalo;
      ctx.fillRect(0, 0, width, height);

      // Update and project plexus nodes
      const projectedNodes = nodes.map(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Bounded box wrap/bounce
        const box = 420;
        if (node.x > box || node.x < -box) node.vx *= -1;
        if (node.y > box || node.y < -box) node.vy *= -1;
        if (node.z > box || node.z < -box) node.vz *= -1;

        let pt = { x: node.x, y: node.y, z: node.z };

        // Apply camera tilt
        pt = rotateY(pt, camera.rotY);
        pt = rotateX(pt, camera.rotX);

        return {
          ...project(pt),
          baseColor: node.baseColor,
          radius: node.radius,
        };
      });

      // ────────────────────────────────────────────────────────────────
      // DRAW PLEXUS CONNECTIONS
      // ────────────────────────────────────────────────────────────────
      const connectionDist = 170;
      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];

          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < connectionDist) {
            const avgZ = (p1.z + p2.z) / 2;
            const depthFactor = Math.max(0.1, 1 - (avgZ + 450) / 1200);
            const distFactor = 1 - dist3D / connectionDist;
            const opacity = distFactor * depthFactor * 0.28;

            if (opacity > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              grad.addColorStop(0, `rgba(${p1.baseColor}, ${opacity})`);
              grad.addColorStop(1, `rgba(${p2.baseColor}, ${opacity})`);
              ctx.strokeStyle = grad;
              ctx.lineWidth = distFactor * 0.8 + 0.1;
              ctx.stroke();
            }
          }
        }
      }

      // ────────────────────────────────────────────────────────────────
      // DRAW MOUSE GRAVITATIONAL WEB
      // ────────────────────────────────────────────────────────────────
      if (mouse.active) {
        projectedNodes.forEach((p, idx) => {
          const dx = p.x - mouse.px;
          const dy = p.y - mouse.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxMagneticDist = 220;

          if (dist < maxMagneticDist) {
            const factor = 1 - dist / maxMagneticDist;
            const opacity = factor * 0.38;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.px, mouse.py);
            ctx.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
            ctx.lineWidth = factor * 1.5;
            ctx.stroke();

            // Attract/Repel effect
            const pullStrength = factor * 0.9;
            nodes[idx].vx += (mouse.targetX * 0.004 - nodes[idx].vx) * pullStrength * 0.08;
            nodes[idx].vy += (mouse.targetY * 0.004 - nodes[idx].vy) * pullStrength * 0.08;
          }
        });
      }

      // Draw nodes
      projectedNodes.forEach(p => {
        const depthFactor = Math.max(0.2, 1 - (p.z + 450) / 1200);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.baseColor}, ${depthFactor * 0.8})`;
        ctx.shadowColor = `rgba(${p.baseColor}, 0.9)`;
        ctx.shadowBlur = p.radius * p.scale * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ────────────────────────────────────────────────────────────────
      // DRAW 3D CRYSTAL & ORBITAL SYSTEM
      // ────────────────────────────────────────────────────────────────
      
      // Decouple geometry center from canvas center
      // Shuffled right on desktop next to text, centered on mobile/tablet
      const geomCenterX = width > 950 ? (width / 2 + Math.min(320, width * 0.25)) : (width / 2);
      const geomCenterY = width > 950 ? 300 : 250;

      // Project 3D point using the geometry center
      const projectGeometry = (point) => {
        const scale = camera.fov / (camera.fov + point.z + camera.z);
        return {
          x: point.x * scale + geomCenterX,
          y: point.y * scale + geomCenterY,
          scale,
          z: point.z,
        };
      };

      // Project Icosahedron Vertices
      const transformedIcoVertices = icoVertices.map(v => {
        let pt = rotateZ(v, geomRotZ);
        pt = rotateY(pt, geomRotY);
        pt = rotateX(pt, geomRotX);

        pt = rotateY(pt, camera.rotY);
        pt = rotateX(pt, camera.rotX);

        return projectGeometry(pt);
      });

      // Project Ring 1 Vertices
      const transformedRing1 = ring1Vertices.map(v => {
        let pt = rotateX(v, geomRotY * -0.7);
        pt = rotateY(pt, geomRotZ * 0.5);

        pt = rotateY(pt, camera.rotY);
        pt = rotateX(pt, camera.rotX);

        return projectGeometry(pt);
      });

      // Project Ring 2 Vertices
      const transformedRing2 = ring2Vertices.map(v => {
        let pt = rotateY(v, geomRotX * 0.6);
        pt = rotateZ(pt, geomRotY * -0.4);

        pt = rotateY(pt, camera.rotY);
        pt = rotateX(pt, camera.rotX);

        return projectGeometry(pt);
      });

      // 1. Render Outer Ring 1
      ctx.beginPath();
      transformedRing1.forEach((v, index) => {
        if (index === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1.0;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Render minor dots along Ring 1
      transformedRing1.forEach((v, i) => {
        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.arc(v.x, v.y, 2 * v.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
        }
      });

      // 2. Render Outer Ring 2
      ctx.beginPath();
      transformedRing2.forEach((v, index) => {
        if (index === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1.0;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Render minor dots along Ring 2
      transformedRing2.forEach((v, i) => {
        if (i % 4 === 2) {
          ctx.beginPath();
          ctx.arc(v.x, v.y, 2 * v.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
        }
      });

      // 3. Render Solid Icosahedron Faces using Z-Sorting
      const sortedFaces = icoFaces.map((f, idx) => {
        const z0 = transformedIcoVertices[f[0]].z;
        const z1 = transformedIcoVertices[f[1]].z;
        const z2 = transformedIcoVertices[f[2]].z;
        const avgZ = (z0 + z1 + z2) / 3;
        return { indices: f, avgZ, idx };
      }).sort((a, b) => b.avgZ - a.avgZ);

      sortedFaces.forEach(face => {
        const v0 = transformedIcoVertices[face.indices[0]];
        const v1 = transformedIcoVertices[face.indices[1]];
        const v2 = transformedIcoVertices[face.indices[2]];

        const depthFactor = Math.max(0.1, 1 - (face.avgZ + 300) / 900);

        // Draw Translucent Glass Face
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.closePath();

        const faceR = 99;
        const faceG = 102;
        const faceB = 241;
        const alpha = 0.12 * depthFactor;
        ctx.fillStyle = `rgba(${faceR}, ${faceG}, ${faceB}, ${alpha})`;
        ctx.fill();

        // Draw Edge Outline
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.closePath();
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * depthFactor})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw Glowing Icosahedron Vertices
      transformedIcoVertices.forEach(v => {
        const depthFactor = Math.max(0.2, 1 - (v.z + 300) / 900);
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4 * v.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * depthFactor})`;
        ctx.shadowColor = 'rgba(6, 182, 212, 1)';
        ctx.shadowBlur = 12 * v.scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none select-none z-0"
    />
  );
}
