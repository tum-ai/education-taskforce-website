import { SparklesCore } from "@/components/ui/sparkles";
import styles from "./LandingHero.module.css";

export function LandingHero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.inner} container`}>
        <div className={styles.previewPanel}>
          <div className={styles.heroStack}>
            <h1>AI Edutainment</h1>
            <div className={styles.sparklesBand} aria-hidden="true">
              <div className={styles.glowLine} />
              <SparklesCore
                background="transparent"
                minSize={0.65}
                maxSize={1.6}
                maxParticles={12000}
                mobileMaxParticles={13300}
                mobileParticleDensity={53200}
                particleDensity={32000}
                className={styles.sparklesCanvas}
                particleColor="#F5EFFF"
                speed={0.38}
              />
              <div className={styles.edgeMask} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
