/**
 * Live Audio Commentator Engine for Dream League 3D
 * Provides dynamic speech commentary during football matches
 * Supports English & Uzbek commentary, foul calls, goal screams, out calls,
 * extra time, and penalty announcements, with an instant mute toggle.
 */

class CommentatorEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.9;
  public language: 'uz' | 'en' = 'uz'; // Default to Uzbek/English bilingual commentary
  private lastCommentTime: number = 0;
  private speechQueue: string[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Try to find natural voices
    this.voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 voices[0] || null;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setLanguage(lang: 'uz' | 'en') {
    this.language = lang;
  }

  public speak(textUz: string, textEn: string, priority: boolean = false) {
    if (this.isMuted || !this.synth) return;

    const now = performance.now();
    // Prevent overlapping spam unless high-priority event (like Goal / Red Card)
    if (!priority && now - this.lastCommentTime < 2800) {
      return;
    }

    if (priority) {
      this.synth.cancel();
    }

    const textToSpeak = this.language === 'uz' ? textUz : textEn;
    this.lastCommentTime = now;

    try {
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      if (this.voice) utter.voice = this.voice;
      utter.volume = this.volume;
      utter.rate = priority ? 1.15 : 1.05;
      utter.pitch = priority ? 1.2 : 1.0;
      this.synth.speak(utter);
    } catch {
      // Speech synthesis fallback
    }
  }

  // Common Football Commentary Triggers
  public commentKickoff(homeTeam: string, awayTeam: string) {
    this.speak(
      `Assalomu alaykum! ${homeTeam} va ${awayTeam} o'rtasidagi hayajonli uchrashuv boshlandi!`,
      `Welcome to today's massive match between ${homeTeam} and ${awayTeam}! Kickoff is underway!`,
      true
    );
  }

  public commentPass() {
    const uz = [
      'Ajoyib uzatma!',
      'To\'p nazorat qilinmoqda.',
      'Markaz orqali hujum rivojlanmoqda.',
      'Chiroyli pas!'
    ];
    const en = [
      'Crisp passing play!',
      'Good vision to find the open teammate.',
      'Working the ball through midfield.',
      'Neat exchange of passes.'
    ];
    const idx = Math.floor(Math.random() * uz.length);
    this.speak(uz[idx], en[idx]);
  }

  public commentShot() {
    const uz = [
      'Zarba yo\'llandi!',
      'Darvoza sari kuchli zarba!',
      'Uzoq masofadan xavfli zarba!'
    ];
    const en = [
      'He strikes it with power!',
      'Fires towards goal!',
      'Ambitious effort from distance!'
    ];
    const idx = Math.floor(Math.random() * uz.length);
    this.speak(uz[idx], en[idx], true);
  }

  public commentSave() {
    this.speak(
      'Darvozabondan ajoyib seyv! To\'p qaytarildi!',
      'What a diving save by the goalkeeper! Incredible reflexes!'
    );
  }

  public commentGoal(scorerName: string) {
    this.speak(
      `GOOOOOL! ${scorerName} to'pni darvoza to'riga joylab qo'ydi! Aqlbovar qilmas gol!`,
      `GOOOAAAL! An absolute wonderstrike by ${scorerName}! What a finish!`,
      true
    );
  }

  public commentSlideTackle() {
    const uz = [
      'Toza podkat! To\'p olib qo\'yildi.',
      'Ajoyib himoyalanish podkat bilan!',
      'Qat\'iy podkat to\'pga.'
    ];
    const en = [
      'Clean sliding tackle to win the ball!',
      'Superb slide challenge!',
      'Timed the tackle to perfection!'
    ];
    const idx = Math.floor(Math.random() * uz.length);
    this.speak(uz[idx], en[idx]);
  }

  public commentFoul(isYellow = false, isRed = false) {
    if (isRed) {
      this.speak(
        'Qo\'pol qoidabuzarlik! Hakam cho\'ntagidan QIZIL kartochkani chiqardi! Maydondan chetlatish!',
        'A reckless challenge! The referee shows a straight RED CARD! He is off!',
        true
      );
    } else if (isYellow) {
      this.speak(
        'Qoidabuzarlik! Hakam futbolchiga SARIQ kartochka ko\'rsatmoqda!',
        'Foul! The referee reaches into his pocket and issues a YELLOW CARD!',
        true
      );
    } else {
      this.speak(
        'Hakam hushtagi chalindi, qoidabuzarlik!',
        'The referee blows for a foul.'
      );
    }
  }

  public commentFreeKick() {
    this.speak(
      'Xavfli nuqtadan shtrafnoy zarbasi belgilandi! Jonli devor qurilmoqda.',
      'Dangerous free kick in shooting range! The wall is set!'
    );
  }

  public commentPenalty() {
    this.speak(
      'PENALTI! Jarima maydoni ichida qoidabuzarlik va 11 metrlik jarima zarbasi!',
      'PENALTY! A huge decision inside the box! Penalty awarded!',
      true
    );
  }

  public commentThrowIn() {
    this.speak(
      'To\'p maydon chizig\'idan chiqib ketdi. Aut!',
      'Ball deflects over the touchline for a throw-in.'
    );
  }

  public commentCorner() {
    this.speak(
      'Burchak to\'pi! Burchakdan uzatma amalga oshiriladi.',
      'Corner kick awarded! Big aerial opportunity here.'
    );
  }

  public commentGoalKick() {
    this.speak(
      'To\'p hujumchidan chiqdi. Darvozadan tepish.',
      'Goal kick to be taken from the six yard box.'
    );
  }

  public commentExtraTime() {
    this.speak(
      '90 minut tugadi, hisob teng! 15 sekunddan 2 ta qo\'shimcha bo\'lim boshlanmoqda!',
      'Full time draw! We move into two dramatic extra time halves!',
      true
    );
  }

  public commentPenalties() {
    this.speak(
      'Qo\'shimcha bo\'limlarda ham g\'olib aniqlanmadi! Endi 5 tadan penaltilar seriyasi boshlanadi!',
      'Still level after extra time! We head to a high-stakes 5-penalty shootout!',
      true
    );
  }
}

export const commentator = new CommentatorEngine();
