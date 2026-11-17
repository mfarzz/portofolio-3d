export function MotionBand() {
  return <div className="motion-band" aria-hidden="true"><div className="motion-band-track">{Array.from({length: 4}, (_, index) => <span key={index}>BUILD <i>✳</i> TEST <i>✳</i> SHIP <i>✳</i> REPEAT <i>✳</i></span>)}</div></div>;
}
