import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EnergySphere3D = ({ energyIndex = 75 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 260;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.8;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 3. 多梯度色彩与动效配置 (按能量值 0~100 产生戏剧性对比)
    let coreHex = 0x10b981; // 默认翡翠绿
    let ringHex = 0x34d399;
    let particleCount = 800;
    let particleSize = 0.055;
    let baseSpeed = 0.015;
    let pulseFrequency = 2.0;
    let pulseAmplitude = 0.08;
    let ringCount = 2;

    if (energyIndex >= 85) {
      // 级别 4: 炽热超能心流态 (85~100)
      coreHex = 0xf59e0b; // 炽热金
      ringHex = 0xfbbf24; // 耀斑金
      particleCount = 1500;
      particleSize = 0.075;
      baseSpeed = 0.038;
      pulseFrequency = 4.5;
      pulseAmplitude = 0.18;
      ringCount = 3;
    } else if (energyIndex >= 60) {
      // 级别 3: 稳健赛博翡翠态 (60~84)
      coreHex = 0x10b981; // 翡翠绿
      ringHex = 0x06b6d4; // 电光青
      particleCount = 1000;
      particleSize = 0.06;
      baseSpeed = 0.022;
      pulseFrequency = 3.0;
      pulseAmplitude = 0.12;
      ringCount = 2;
    } else if (energyIndex >= 30) {
      // 级别 2: 活跃青绿态 (30~59)
      coreHex = 0x06b6d4; // 青蓝
      ringHex = 0x8b5cf6; // 紫色
      particleCount = 650;
      particleSize = 0.048;
      baseSpeed = 0.012;
      pulseFrequency = 2.0;
      pulseAmplitude = 0.07;
      ringCount = 2;
    } else {
      // 级别 1: 蓄力沉睡态 (0~29)
      coreHex = 0x6366f1; // 蓝紫
      ringHex = 0x475569; // 灰蓝
      particleCount = 350;
      particleSize = 0.038;
      baseSpeed = 0.005;
      pulseFrequency = 1.0;
      pulseAmplitude = 0.03;
      ringCount = 1;
    }

    const coreColor = new THREE.Color(coreHex);
    const ringColor = new THREE.Color(ringHex);

    // 4. 粒子能量球主体
    const sphereGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 1.6;
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const r = radius + (Math.random() - 0.5) * 0.25;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      const mixRatio = (y + radius) / (2 * radius);
      const pColor = coreColor.clone().lerp(ringColor, mixRatio);
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    sphereGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sphereGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sphereMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    const sphereMesh = new THREE.Points(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    // 5. 外层多维旋转星轨环
    const orbitalRings = [];
    const ringParticlesPerRing = 240;

    for (let rIdx = 0; rIdx < ringCount; rIdx++) {
      const ringGeo = new THREE.BufferGeometry();
      const ringPos = new Float32Array(ringParticlesPerRing * 3);
      const ringRadius = 2.2 + rIdx * 0.45;

      for (let i = 0; i < ringParticlesPerRing; i++) {
        const angle = (i / ringParticlesPerRing) * Math.PI * 2;
        ringPos[i * 3] = Math.cos(angle) * (ringRadius + (Math.random() - 0.5) * 0.12);
        ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
        ringPos[i * 3 + 2] = Math.sin(angle) * (ringRadius + (Math.random() - 0.5) * 0.12);
      }

      ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
      const ringMat = new THREE.PointsMaterial({
        color: ringColor,
        size: particleSize * 0.85,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });

      const ringMesh = new THREE.Points(ringGeo, ringMat);
      if (rIdx === 0) {
        ringMesh.rotation.x = Math.PI / 3.5;
        ringMesh.rotation.z = Math.PI / 5;
      } else if (rIdx === 1) {
        ringMesh.rotation.x = -Math.PI / 4;
        ringMesh.rotation.y = Math.PI / 6;
      } else {
        ringMesh.rotation.z = Math.PI / 2.5;
      }

      scene.add(ringMesh);
      orbitalRings.push({ mesh: ringMesh, geo: ringGeo, mat: ringMat, factor: (rIdx + 1) * 1.2 });
    }

    // 6. 鼠标视差微动
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / height) * 2 - 1);
    };
    currentMount.addEventListener('mousemove', handleMouseMove);

    // 7. 动画主循环 (包含心跳膨胀脉冲与高能物理扰动)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 自转
      sphereMesh.rotation.y += baseSpeed;
      sphereMesh.rotation.x += baseSpeed * 0.35;

      orbitalRings.forEach((r, idx) => {
        const dir = idx % 2 === 0 ? -1 : 1;
        r.mesh.rotation.y += baseSpeed * r.factor * dir;
        r.mesh.rotation.z += baseSpeed * 0.6 * dir;
      });

      // 实时动态呼吸脉冲 (根据能量指数动态伸缩)
      const positionAttr = sphereGeometry.attributes.position;
      const pulseScale = 1 + Math.sin(elapsedTime * pulseFrequency) * pulseAmplitude;

      for (let i = 0; i < particleCount; i++) {
        positionAttr.setXYZ(
          i,
          basePositions[i * 3] * pulseScale,
          basePositions[i * 3 + 1] * pulseScale,
          basePositions[i * 3 + 2] * pulseScale
        );
      }
      positionAttr.needsUpdate = true;

      // 鼠标平滑插值跟随
      camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.9 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // 8. 窗口尺寸自适应
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeEventListener('mousemove', handleMouseMove);
        if (renderer.domElement && currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      }
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      orbitalRings.forEach((r) => {
        r.geo.dispose();
        r.mat.dispose();
      });
      renderer.dispose();
    };
  }, [energyIndex]);

  // 根据当前能量值动态输出状态指示
  const getStatusBadge = () => {
    if (energyIndex >= 85) {
      return { text: '⚡ 炽热心流态', color: '#F59E0B', desc: '转速极快 · 粒子高密扩散' };
    } else if (energyIndex >= 60) {
      return { text: '🚀 稳健自律态', color: '#10B981', desc: '转速平稳 · 翡翠绿双星轨' };
    } else if (energyIndex >= 30) {
      return { text: '🌱 活力蓄势态', color: '#06B6D4', desc: '青蓝脉冲 · 稳步蓄力' };
    } else {
      return { text: '💤 能量沉睡态', color: '#818CF8', desc: '慢速漂浮 · 待打卡唤醒' };
    }
  };

  const status = getStatusBadge();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '240px',
          cursor: 'grab',
        }}
      />
      {/* 能量状态指示浮条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '8px',
          border: `1px solid ${status.color}40`,
          fontSize: '11px',
          marginTop: '-6px',
        }}
      >
        <span style={{ color: status.color, fontWeight: 700 }}>
          {status.text} ({energyIndex}分)
        </span>
        <span style={{ color: '#94A3B8' }}>{status.desc}</span>
      </div>
    </div>
  );
};

export default EnergySphere3D;
