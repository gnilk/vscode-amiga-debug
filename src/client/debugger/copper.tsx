import { Fragment, FunctionComponent, h, JSX, createContext } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../styles.css';
import styles from './copper.module.css';

import { IProfileModel } from '../model';
declare const MODEL: IProfileModel;

import { CopperDisassembler, CopperInstructionType, CopperMove } from '../copperDisassembler';
import { CustomRegisters } from '../customRegisters';
import { GetCopper, Copper } from '../dma';

export const CopperView: FunctionComponent<{
	time: number
}> = ({ time }) => {
	const copper = useMemo(() => GetCopper(MODEL.memory.chipMem, MODEL.amiga.dmaRecords), [MODEL]);
	const containerRef = useRef<HTMLDivElement>();

	// get copper instruction that is executing at 'time'
	let curInsn = -1;
	for(let i = 0; i < copper.length - 1; i++) {
		if(copper[i].cycle <= time >> 1 && copper[i + 1].cycle > time >> 1) {
			curInsn = i;
			break;
		}
	}
	if(curInsn === -1) {
		// end of copperlist?
		if(copper.length > 0 && copper[copper.length - 1].cycle <= time >> 1)
			curInsn = copper.length - 1;
	}

	useEffect(() => {
		if(copper.length === 0 || !containerRef.current)
			return;

		// smooth scrolling if just clicking on the timeline, instant scrolling when dragging
		const now = performance.now();
		const behavior: ScrollBehavior = (now - containerRef.current['lastUpdate'] > 100) ? 'smooth' : 'auto';
		containerRef.current['lastUpdate'] = now;
		containerRef.current.children[Math.max(0, curInsn)].scrollIntoView({ behavior, block: 'center' });
	}, [curInsn, containerRef.current]);

	return (<div ref={containerRef} class={styles.container}>
		{copper.map((c) => <div class={styles.fixed + ' ' + (curInsn !== -1 && c === copper[curInsn] ? styles.cur : (c.cycle > (time >> 1) ? styles.future : styles.past))}>
			{'L' + c.vpos.toString().padStart(3, '0') + 'C' + c.hpos.toString().padStart(3, '0') + ': ' + c.insn.toString()}
			{(c.insn.instructionType === CopperInstructionType.MOVE && (c.insn as CopperMove).label.startsWith('COLOR')) ? <span style={{marginLeft: 4, background: `#${(c.insn as CopperMove).RD.toString(16).padStart(3, '0')}`}}>&nbsp;&nbsp;</span> : ''}
		</div>)}
	</div>);
};
