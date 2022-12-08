import { h } from 'preact';

interface HeroProps {
  headline: string;
}

function Hero({ partial }: { partial: HeroProps }): h.JSX.Element {
  return (
    <div className="hero">
      <div className="hero__headline">{partial.headline}</div>
    </div>
  );
}

export default Hero;
