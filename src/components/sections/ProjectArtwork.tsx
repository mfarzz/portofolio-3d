import { useId } from 'react';
import type { Project } from '../../app/data/portfolio';

/** Original editorial illustrations, not screenshots of confidential applications. */
export function ProjectArtwork({ project }: { project: Project }) {
  const id = useId().replace(/:/g, '');
  const paper = 'url(#paper-' + id + ')';
  return <svg className={'project-artwork artwork-' + project.style} viewBox="0 0 600 420" role="img" aria-label={'Ilustrasi konsep ' + project.title}>
    <defs>
      <linearGradient id={'paper-' + id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffdf4" /><stop offset="1" stopColor="#e1dece" /></linearGradient>
      <filter id={'shadow-' + id} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="18" stdDeviation="13" floodOpacity=".12" /></filter>
    </defs>
    <g filter={'url(#shadow-' + id + ')'}>
      {project.style === 'rintas' && <>
        <g transform="translate(109 88) rotate(-14 100 110)"><path d="M0 0h112l44 45v172H0Z" fill="#a3b788" stroke="#668354" /><path d="M112 0v45h44" fill="none" stroke="#668354" /></g>
        <g transform="translate(238 103) rotate(12 100 110)"><path d="M0 0h125l45 45v205H0Z" fill={paper} stroke="#d5d4bc" /><path d="M125 0v45h45" fill="none" stroke="#c5c8b1" /><path d="M27 92h96M27 110h75M27 128h89" stroke="#a7b18f" strokeWidth="7" /></g>
        <circle cx="303" cy="211" r="53" fill="#dafa69" stroke="#819443" /><path d="M273 211h60m-20-20 20 20-20 20" fill="none" stroke="#34402c" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="140" cy="288" r="8" fill="#30462d" /><path d="M430 92v24m-12-12h24" stroke="#6a8351" strokeWidth="2" />
      </>}
      {project.style === 'rms' && <>
        <path d="M171 157h122v128h140M293 157h135" stroke="#858fab" strokeWidth="3" strokeDasharray="5 8" fill="none" />
        <rect x="90" y="103" width="150" height="182" rx="13" fill={paper} transform="rotate(-8 165 194)" />
        <circle cx="161" cy="154" r="25" fill="#bac6d9" /><path d="M119 231c0-51 84-51 84 0" fill="#bac6d9" /><path d="M118 254h88" stroke="#d4d6d3" strokeWidth="6" />
        <rect x="352" y="91" width="144" height="95" rx="12" fill="#3c4c71" transform="rotate(8 424 138)" /><path d="m393 136 16 16 31-32" stroke="#d9f269" strokeWidth="7" fill="none" strokeLinecap="round" />
        <rect x="344" y="239" width="165" height="96" rx="12" fill="#c0cce2" transform="rotate(-6 426 287)" /><path d="M372 271h98m-98 18h68m-68 18h84" stroke="#7584a4" strokeWidth="6" />
        <circle cx="293" cy="157" r="16" fill="#fa705b" /><circle cx="293" cy="285" r="8" fill="#3c4c71" />
      </>}
      {project.style === 'ally' && <>
        <g transform="rotate(-12 180 215)"><rect x="87" y="85" width="166" height="253" rx="13" fill="#7a6190" /><rect x="105" y="106" width="130" height="91" rx="5" fill="#bba6ca" /><path d="M105 221h99m-99 17h120" stroke="#dbcbe5" strokeWidth="6" /><rect x="105" y="273" width="130" height="39" rx="5" fill="#d8f572" /></g>
        <g transform="rotate(10 388 215)"><rect x="285" y="117" width="229" height="198" rx="13" fill={paper} /><rect x="303" y="136" width="90" height="109" rx="5" fill="#ceb8d6" /><path d="M410 148h79m-79 18h62m-62 18h73" stroke="#bdb3bf" strokeWidth="6" /><rect x="410" y="211" width="79" height="34" rx="5" fill="#d8f572" /><path d="M303 275h186" stroke="#dedacd" strokeWidth="7" /></g>
        <path d="m263 164 13 14-13 14m-11-14h24" stroke="#fa705b" strokeWidth="5" strokeLinecap="round" fill="none" /><circle cx="294" cy="79" r="8" fill="#75568c" />
      </>}
      {project.style === 'mailblast' && <>
        <g transform="rotate(-12 300 230)"><rect x="151" y="140" width="298" height="185" rx="10" fill="#ca6d50" /><path d="m155 148 145 112 145-112" fill="#e99371" /><path d="m155 318 103-93m187 93-103-93" stroke="#a34d3b" strokeWidth="2" /></g>
        <g transform="rotate(7 300 155)"><rect x="192" y="66" width="213" height="171" rx="5" fill={paper} /><path d="M222 100h105m-105 23h154m-154 23h131m-131 23h146" stroke="#d4c7ab" strokeWidth="7" /><circle cx="364" cy="199" r="19" fill="#d9f269" /><path d="m356 199 6 6 11-12" stroke="#4c6136" strokeWidth="3" fill="none" /></g>
        <path d="M99 118h59m-81 23h59M450 80h42m-24-18 24 18-24 18" fill="none" stroke="#b2684b" strokeWidth="3" strokeLinecap="round" /><circle cx="491" cy="289" r="8" fill="#b2684b" />
      </>}
    </g>
  </svg>;
}
