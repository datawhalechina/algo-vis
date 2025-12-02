import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * Speech（语音）相关题目数据
 * 语音处理经典题型
 */
export const speechProblems: AIProblem[] = [
  {
    id: 10048,
    slug: "spectrogram",
    title: "频谱图（Spectrogram）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.EASY,
    description:
      "展示如何将时域的音频信号转换为频域的频谱图。理解短时傅里叶变换（STFT）如何将音频分解为时间和频率的二维表示，这是语音处理的基础。",
    learningGoals: [
      "理解频谱图的基本概念",
      "掌握短时傅里叶变换（STFT）的原理",
      "理解时域到频域转换的过程",
      "观察不同音频信号的频谱特征",
    ],
    inputs: [
      "audio_signal：时域音频信号",
      "window_size：窗口大小",
      "hop_length：跳跃长度",
      "n_fft：FFT 点数",
    ],
    outputs: [
      "spectrogram：频谱图矩阵",
      "frequencies：频率轴",
      "time_frames：时间帧",
      "magnitude_spectrum：幅度谱",
    ],
    tags: ["频谱图", "STFT", "频域分析", "基础"],
    examples: [
      {
        input: "audio_signal = 1秒音频，采样率 = 16000 Hz",
        output: "spectrogram = [时间帧数, 频率bins] 的二维矩阵",
        explanation:
          "通过 STFT 将音频信号转换为时间和频率的二维表示，可以直观地看到不同时刻的频率成分。",
      },
    ],
    heroNote: "频谱图是语音处理的基础，几乎所有语音任务都从频谱图开始。",
  },
  {
    id: 10049,
    slug: "mel-spectrogram",
    title: "梅尔频谱图（Mel Spectrogram）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示如何将线性频率刻度转换为梅尔频率刻度，生成梅尔频谱图。理解梅尔刻度如何更好地模拟人耳对频率的感知，这是语音识别和语音合成的基础。",
    learningGoals: [
      "理解梅尔刻度的概念和作用",
      "掌握梅尔滤波器组的构建",
      "理解线性频率到梅尔频率的转换",
      "观察梅尔频谱图与普通频谱图的区别",
    ],
    inputs: [
      "spectrogram：普通频谱图",
      "n_mels：梅尔滤波器数量",
      "fmin：最低频率",
      "fmax：最高频率",
    ],
    outputs: [
      "mel_spectrogram：梅尔频谱图",
      "mel_filters：梅尔滤波器组",
      "mel_frequencies：梅尔频率刻度",
    ],
    tags: ["梅尔频谱图", "Mel Scale", "语音识别", "特征提取"],
    examples: [
      {
        input: "spectrogram = [时间, 频率], n_mels = 80",
        output: "mel_spectrogram = [时间, 80]",
        explanation:
          "通过梅尔滤波器组将线性频率转换为梅尔频率，低频区域分辨率更高，更符合人耳感知。",
      },
    ],
    heroNote: "梅尔频谱图是语音识别和语音合成中最常用的特征表示。",
  },
  {
    id: 10050,
    slug: "mfcc",
    title: "MFCC（梅尔频率倒谱系数）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示如何从梅尔频谱图中提取 MFCC 特征。理解倒谱分析如何分离频谱包络和细节，MFCC 是传统语音识别系统的核心特征。",
    learningGoals: [
      "理解 MFCC 的提取流程",
      "掌握倒谱分析（Cepstral Analysis）的原理",
      "理解 DCT（离散余弦变换）的作用",
      "观察 MFCC 系数的物理意义",
    ],
    inputs: [
      "mel_spectrogram：梅尔频谱图",
      "n_mfcc：MFCC 系数数量（通常为 13）",
      "dct_type：DCT 类型",
    ],
    outputs: [
      "mfcc_coefficients：MFCC 系数矩阵",
      "mfcc_delta：一阶差分（Delta）",
      "mfcc_delta2：二阶差分（Delta-Delta）",
    ],
    tags: ["MFCC", "特征提取", "语音识别", "传统方法"],
    examples: [
      {
        input: "mel_spectrogram = [时间, 80], n_mfcc = 13",
        output: "mfcc_coefficients = [时间, 13]",
        explanation:
          "通过 DCT 变换从梅尔频谱中提取 13 个 MFCC 系数，这些系数捕获了语音的主要特征。",
      },
    ],
    heroNote: "MFCC 是传统语音识别系统的标准特征，至今仍被广泛使用。",
  },
  {
    id: 10051,
    slug: "voice-activity-detection",
    title: "语音活动检测（VAD）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示语音活动检测如何区分语音段和静音段。理解如何通过能量、过零率等特征判断音频中是否包含语音，这是语音处理的重要预处理步骤。",
    learningGoals: [
      "理解语音活动检测的任务目标",
      "掌握能量阈值检测方法",
      "理解过零率（ZCR）在 VAD 中的作用",
      "观察不同环境下的 VAD 效果",
    ],
    inputs: [
      "audio_signal：音频信号",
      "frame_size：帧大小",
      "energy_threshold：能量阈值",
      "zcr_threshold：过零率阈值",
    ],
    outputs: [
      "vad_labels：语音/非语音标签序列",
      "energy_levels：每帧的能量值",
      "zcr_values：每帧的过零率",
      "voice_segments：检测到的语音段",
    ],
    tags: ["VAD", "语音检测", "预处理", "应用"],
    examples: [
      {
        input: "audio_signal = 包含语音和静音的音频",
        output: "vad_labels = [0,0,1,1,1,0,0,1,1,0] (0=静音, 1=语音)",
        explanation:
          "通过分析每帧的能量和过零率，判断该帧是否包含语音，从而定位语音段。",
      },
    ],
    heroNote:
      "VAD 是语音处理的重要预处理步骤，广泛应用于语音识别、语音增强等任务。",
  },
  {
    id: 10052,
    slug: "speech-recognition",
    title: "语音识别（ASR）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.HARD,
    description:
      "展示自动语音识别（ASR）系统如何将语音信号转换为文本。理解声学模型、语言模型和解码器如何协同工作，以及端到端模型（如 CTC、Attention）的工作原理。",
    learningGoals: [
      "理解语音识别的基本流程",
      "掌握声学模型的作用",
      "理解语言模型在识别中的作用",
      "观察解码过程如何生成文本",
    ],
    inputs: [
      "audio_signal：音频信号",
      "acoustic_model：声学模型（如 DeepSpeech、Wav2Vec）",
      "language_model：语言模型（可选）",
    ],
    outputs: [
      "phoneme_probabilities：音素概率序列",
      "character_probabilities：字符概率序列",
      "transcribed_text：识别的文本",
      "confidence_scores：置信度分数",
    ],
    tags: ["语音识别", "ASR", "CTC", "端到端"],
    examples: [
      {
        input: "audio_signal = '你好世界' 的语音",
        output: "transcribed_text = '你好世界'",
        explanation:
          "声学模型将音频特征转换为音素或字符概率，解码器根据这些概率生成最可能的文本序列。",
      },
    ],
    heroNote:
      "语音识别是语音处理的核心应用，广泛应用于语音助手、语音输入等场景。",
  },
  {
    id: 10053,
    slug: "text-to-speech",
    title: "文本转语音（TTS）",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.HARD,
    description:
      "展示文本转语音系统如何将文本转换为自然流畅的语音。理解声码器（Vocoder）和声学模型如何协同工作，以及现代神经 TTS 系统（如 Tacotron、WaveNet）的工作原理。",
    learningGoals: [
      "理解文本转语音的基本流程",
      "掌握声学模型如何生成声学特征",
      "理解声码器如何将特征转换为音频",
      "观察不同 TTS 模型的生成过程",
    ],
    inputs: [
      "text：输入文本",
      "tts_model：TTS 模型（如 Tacotron、FastSpeech）",
      "vocoder：声码器（如 WaveNet、HiFi-GAN）",
    ],
    outputs: [
      "acoustic_features：声学特征（如梅尔频谱）",
      "audio_waveform：生成的音频波形",
      "duration_predictions：音素时长预测",
      "pitch_contour：音调轮廓",
    ],
    tags: ["TTS", "文本转语音", "声码器", "语音合成"],
    examples: [
      {
        input: "text = '你好世界'",
        output: "audio_waveform = 对应的语音音频",
        explanation:
          "TTS 模型将文本转换为声学特征，声码器将特征转换为可听的音频波形。",
      },
    ],
    heroNote: "TTS 是语音处理的重要应用，广泛应用于语音助手、有声读物等场景。",
  },
  {
    id: 10054,
    slug: "speaker-identification",
    title: "说话人识别",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示说话人识别系统如何识别音频中的说话人身份。理解说话人特征提取和说话人嵌入（Speaker Embedding）如何捕获说话人的独特特征。",
    learningGoals: [
      "理解说话人识别的任务目标",
      "掌握说话人特征提取方法",
      "理解说话人嵌入的构建",
      "观察不同说话人的特征差异",
    ],
    inputs: [
      "audio_signal：音频信号",
      "speaker_model：说话人识别模型（如 x-vector、ECAPA-TDNN）",
      "enrolled_speakers：已注册的说话人列表",
    ],
    outputs: [
      "speaker_embedding：说话人嵌入向量",
      "speaker_identity：识别的说话人 ID",
      "similarity_scores：与已注册说话人的相似度",
      "confidence_score：识别置信度",
    ],
    tags: ["说话人识别", "Speaker ID", "特征提取", "应用"],
    examples: [
      {
        input:
          "audio_signal = 某人的语音，enrolled_speakers = [Alice, Bob, Charlie]",
        output: "speaker_identity = 'Alice', confidence = 0.95",
        explanation:
          "模型提取说话人特征，与已注册的说话人进行匹配，识别出最相似的说话人。",
      },
    ],
    heroNote: "说话人识别广泛应用于身份验证、语音助手个性化等场景。",
  },
  {
    id: 10055,
    slug: "speech-enhancement",
    title: "语音增强",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.HARD,
    description:
      "展示语音增强系统如何从带噪语音中恢复清晰语音。理解降噪、去混响等技术的原理，以及深度学习在语音增强中的应用。",
    learningGoals: [
      "理解语音增强的任务目标",
      "掌握频谱减法和维纳滤波等传统方法",
      "理解深度学习在语音增强中的应用",
      "观察增强前后的频谱对比",
    ],
    inputs: [
      "noisy_audio：带噪音频信号",
      "enhancement_model：语音增强模型",
      "noise_profile：噪声特征（可选）",
    ],
    outputs: [
      "enhanced_audio：增强后的音频",
      "noise_estimate：估计的噪声",
      "enhanced_spectrogram：增强后的频谱图",
      "snr_improvement：信噪比改善程度",
    ],
    tags: ["语音增强", "降噪", "去混响", "应用"],
    examples: [
      {
        input: "noisy_audio = 包含背景噪声的语音",
        output: "enhanced_audio = 降噪后的清晰语音",
        explanation:
          "模型估计并去除噪声成分，保留语音信号，提升语音质量和可懂度。",
      },
    ],
    heroNote: "语音增强广泛应用于通信系统、助听器、语音识别预处理等场景。",
  },
  {
    id: 10056,
    slug: "phoneme-recognition",
    title: "音素识别",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示音素识别如何将语音信号映射到音素序列。理解音素作为语音的基本单位，以及音素识别在语音识别系统中的作用。",
    learningGoals: [
      "理解音素的概念和作用",
      "掌握音素识别的任务目标",
      "理解音素与字符的关系",
      "观察不同音素的声学特征",
    ],
    inputs: [
      "audio_signal：音频信号",
      "phoneme_model：音素识别模型",
      "phoneme_set：音素集合（如 IPA、CMU）",
    ],
    outputs: [
      "phoneme_sequence：识别的音素序列",
      "phoneme_probabilities：每个音素的概率",
      "phoneme_boundaries：音素边界",
      "phoneme_durations：音素时长",
    ],
    tags: ["音素识别", "Phoneme", "语音识别", "基础任务"],
    examples: [
      {
        input: "audio_signal = 'hello' 的语音",
        output: "phoneme_sequence = ['HH', 'EH', 'L', 'OW']",
        explanation:
          "模型将语音信号分解为音素序列，每个音素对应一个基本的语音单位。",
      },
    ],
    heroNote: "音素识别是语音识别的基础，理解音素有助于理解语音的结构。",
  },
  {
    id: 10057,
    slug: "prosody-analysis",
    title: "韵律分析",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示韵律分析如何提取语音的韵律特征，包括音调（Pitch）、节奏（Rhythm）和重音（Stress）。理解韵律在语音理解和生成中的重要作用。",
    learningGoals: [
      "理解韵律的概念和组成",
      "掌握音调（F0）的提取方法",
      "理解节奏和重音的分析",
      "观察不同语言的韵律特征",
    ],
    inputs: ["audio_signal：音频信号", "analysis_window：分析窗口大小"],
    outputs: [
      "pitch_contour：音调轮廓（F0）",
      "rhythm_pattern：节奏模式",
      "stress_labels：重音标签",
      "prosody_features：韵律特征向量",
    ],
    tags: ["韵律分析", "Prosody", "音调", "语音分析"],
    examples: [
      {
        input: "audio_signal = 包含疑问语气的语音",
        output: "pitch_contour = 句末音调上升",
        explanation:
          "通过分析音调变化，可以识别出疑问语气，音调在句末明显上升。",
      },
    ],
    heroNote: "韵律分析帮助理解语音的情感、语气和语义，是语音理解的重要部分。",
  },
  {
    id: 10058,
    slug: "speech-segmentation",
    title: "语音分割",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示语音分割如何将连续语音流分割为单词或音素单元。理解如何通过边界检测、能量变化等特征识别语音单元之间的边界。",
    learningGoals: [
      "理解语音分割的任务目标",
      "掌握边界检测的方法",
      "理解能量和频谱在分割中的作用",
      "观察不同分割粒度的结果",
    ],
    inputs: [
      "audio_signal：连续语音流",
      "segmentation_model：分割模型",
      "unit_type：分割单元类型（单词/音素）",
    ],
    outputs: [
      "segment_boundaries：分割边界位置",
      "segmented_units：分割后的语音单元",
      "boundary_scores：边界置信度分数",
      "unit_labels：单元标签",
    ],
    tags: ["语音分割", "Segmentation", "边界检测", "预处理"],
    examples: [
      {
        input: "audio_signal = '你好世界' 的连续语音",
        output: "segmented_units = ['你好', '世界']",
        explanation:
          "通过检测语音中的停顿和能量变化，将连续语音分割为独立的单词或短语。",
      },
    ],
    heroNote: "语音分割是语音识别和语音理解的重要预处理步骤。",
  },
  {
    id: 10059,
    slug: "voice-cloning",
    title: "语音克隆",
    domain: AIDomain.SPEECH,
    difficulty: Difficulty.HARD,
    description:
      "展示语音克隆系统如何学习并复制特定说话人的声音特征，生成具有该说话人音色的语音。理解说话人编码器和声码器如何协同工作。",
    learningGoals: [
      "理解语音克隆的任务目标",
      "掌握说话人编码器的原理",
      "理解如何分离内容和说话人特征",
      "观察克隆语音与原始语音的相似度",
    ],
    inputs: [
      "reference_audio：参考音频（目标说话人的语音）",
      "source_text：要合成的文本",
      "voice_cloning_model：语音克隆模型（如 SV2TTS、YourTTS）",
    ],
    outputs: [
      "speaker_embedding：说话人嵌入向量",
      "cloned_audio：克隆的语音",
      "similarity_score：与参考语音的相似度",
      "acoustic_features：声学特征",
    ],
    tags: ["语音克隆", "Voice Cloning", "说话人建模", "高级应用"],
    examples: [
      {
        input: "reference_audio = Alice 的语音，source_text = '你好'",
        output: "cloned_audio = 用 Alice 的声音说 '你好'",
        explanation:
          "模型从参考音频中提取说话人特征，然后使用该特征生成新文本的语音，保持说话人的音色。",
      },
    ],
    heroNote:
      "语音克隆是语音合成的前沿技术，广泛应用于个性化语音助手、有声读物等场景。",
  },
];
