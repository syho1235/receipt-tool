import { useState, useRef } from 'react';
import '../styles/globals.css';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const [step, setStep] = useState('upload');
  const [sheet, setSheet] = useState('개인카드');
  const [section, setSection] = useState('기타');
  const [naeyeok, setNaeyeok] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [error, setError] = useState('');
  const [addedCount, setAddedCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') { setError('PDF 파일만 지원됩니다.'); return; }
    setError(''); setStep('loading');
    try {
      const pdfBase64 = await fileToBase64(file);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', pdfBase64 }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || '분석 실패'); }
      const parsed = await res.json();
      setDateVal(parsed.date || ''); setAmount(String(parsed.amount || ''));
      setMerchant(parsed.merchant || ''); setNaeyeok(parsed.product || '');
      setStep('confirm');
    } catch (e) { setError('영수증 분석 실패: ' + e.message); setStep('upload'); }
  };

  const handleDownload = async () => {
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'build', sheet, section, dateVal, amount, merchant, naeyeok }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { xlsxBase64 } = await res.json();
      const bin = atob(xlsxBase64);
      const buf = new ArrayBuffer(bin.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = '26년_3월_예산_신윤호_소2_수정.xlsx';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setAddedCount(c => c + 1); setStep('done');
    } catch (e) { setError('오류: ' + e.message); }
  };

  const addAnother = () => { setStep('upload'); if (inputRef.current) inputRef.current.value = ''; setError(''); };
  const resetAll = () => { setStep('upload'); setAddedCount(0); setError(''); if (inputRef.current) inputRef.current.value = ''; };

  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px 36px', maxWidth: 520, margin: '0 auto' };
  const wrap = { minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 };
  const btn = (c) => ({ background: c || '#4F7FFF', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' });
  const inp = { width: '100%', border: '1.5px solid #ddd', borderRadius: 8, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontWeight: 600, marginBottom: 6, color: '#333', fontSize: 14 };
  const errBox = error ? <div style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fff5f5', borderRadius: 8 }}>⚠️ {error}</div> : null;

  if (step === 'loading') return (
    <div style={wrap}><div style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1a2340', marginBottom: 8 }}>영수증 분석 중...</div>
      <div style={{ fontSize: 13, color: '#888' }}>잠시만 기다려 주세요</div>
    </div></div>
  );

  if (step === 'confirm') return (
    <div style={wrap}><div style={card}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2340', marginBottom: 6 }}>📋 영수증 정보 확인</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>추출된 정보를 확인하고 수정 후 입력하세요</div>
      <div style={{ marginBottom: 14 }}><label style={lbl}>거래 일자</label><input style={inp} value={dateVal} onChange={e => setDateVal(e.target.value)} placeholder="YYYY/MM/DD" /></div>
      <div style={{ marginBottom: 14 }}><label style={lbl}>승인 금액 (원)</label><input style={inp} value={amount} onChange={e => setAmount(e.target.value)} type="number" /></div>
      <div style={{ marginBottom: 14 }}><label style={lbl}>상호명</label><input style={inp} value={merchant} onChange={e => setMerchant(e.target.value)} /></div>
      <div style={{ marginBottom: 20 }}><label style={lbl}>내역 <span style={{ color: '#888', fontWeight: 400 }}>(사용 목적)</span></label><input style={inp} value={naeyeok} onChange={e => setNaeyeok(e.target.value)} placeholder="예: 소년2마을 목자모임 - 간식" /></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><label style={lbl}>시트</label><select style={inp} value={sheet} onChange={e => setSheet(e.target.value)}><option>교회체크카드</option><option>개인카드</option></select></div>
        <div style={{ flex: 1 }}><label style={lbl}>섹션</label><select style={inp} value={section} onChange={e => setSection(e.target.value)}><option>심방사역비</option><option>마을사역비</option><option>기타</option></select></div>
      </div>
      {errBox}
      {addedCount > 0 && <div style={{ background: '#f0fff4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#276749' }}>✅ 이번 세션에서 {addedCount}건 입력됨</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button style={btn('#888')} onClick={addAnother}>← 취소</button>
        <button style={btn()} onClick={handleDownload}>엑셀에 입력 후 다운로드 ↓</button>
      </div>
    </div></div>
  );

  if (step === 'done') return (
    <div style={wrap}><div style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2340', marginBottom: 6 }}>다운로드 완료!</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>총 <strong>{addedCount}건</strong>이 입력된 엑셀이 저장됐어요</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button style={btn()} onClick={addAnother}>➕ 다른 영수증 추가</button>
        <button style={btn('#aaa')} onClick={resetAll}>🔄 처음부터</button>
      </div>
    </div></div>
  );

  return (
    <div style={wrap}><div style={card}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2340', marginBottom: 6 }}>📄 영수증 자동 입력 도구</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>소년 2마을 · 26년 3월 예산 양식</div>
      <div
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#4F7FFF' : '#c8d3f5'}`, borderRadius: 14, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? '#f0f4ff' : '#fafbff', transition: 'all 0.2s', marginBottom: 20 }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>📎</div>
        <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>영수증 PDF를 여기에 드래그</div>
        <div style={{ fontSize: 13, color: '#888' }}>또는 클릭해서 파일 선택</div>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      {errBox}
      <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>이지페이, 쿠팡, 카드사 영수증 PDF 지원<br />분석 후 일자·금액·상호명·내역을 자동으로 채워드려요</div>
    </div></div>
  );
}
