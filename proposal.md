	研究計畫內容：

	摘要
隨著深度學習生成技術的進步，特別是語音合成與唇形同步技術的成熟，使得在真實場景中製作高擬真度的複合式深偽影音難度大幅降低。透過語音合成模型 [1] [2] [3] [4] [5]，攻擊者僅需少量樣本即可達成極高相似度的語音複製，並結合 Wav2Lip [6]等技術實現精確的口型對位，對影音內容真實性與社會信任造成嚴峻挑戰。現有檢測技術多聚焦於單一模態特徵，面對影像偽影、音訊合成痕跡或跨模態一致性等複雜情境時，易產生檢測死角，且多數模型受限於英文語料訓練，在中文環境下存在泛化失效問題。本研究旨在建構一項多模態整合之深偽檢測平台，其核心架構並行部署針對影像偽影模態、針對音訊特徵模態，以及影音同步性模態，藉此降低單一引擎之判定偏誤。為強化系統對中文語境之適配性，本計畫自主建置「FormosaDeepAV」台灣中文多模態深偽影音資料集，採集本土政經影音素材並導入最新生成技術製作中文偽造樣本。此外，系統將導入 Grad-CAM [7]視覺化技術與 SHA-256 雜湊快取機制，提升檢測結果的可解釋性與運算效率。實驗設計透過消融實驗驗證多模態整合架構之必要性，預期在中文複合式深偽情境下達成 90% 以上之檢測準確率，提供一套即時、量化且透明的防禦方案。
	研究動機與研究問題
2.1 研究動機
現代戰爭已不再侷限於武力對抗，資訊戰同樣能在短時間內改變民眾認知、影響士氣與國際輿論。2022年烏俄戰爭期間，曾出現一段被竄改的「烏克蘭總統澤倫斯基呼籲投降」深偽影片，內容宣稱總統發布從未說過的訊息，並透過被入侵的媒體平台擴散，意圖製造混亂。此次事件凸顯了深偽合成技術門檻降低與品質提升的趨勢。鑑於台灣長期處於資訊戰的前線，各類針對政治人物與公眾議題的惡意影音層出不窮，若單靠人工查核已難以追趕生成速度。若不加以防範，恐引發社會信任問題。本研究旨在開發一套多模態檢測系統，透過具備視覺化證據的網頁平台，協助大眾在資訊爆炸時代中辨識真偽，從而降低惡意操弄的風險。
	 研究問題與目的
過往在深度偽造檢測（Deepfake Detection）任務上，學界研究多聚焦於特定範疇的特徵分析。諸如針對影像偽影分析的模型LipsForensics [8]、DepfakeHop [9]，針對音訊合成痕跡的 AASIST [10] 與 Conformer [11]，以及專注於跨模態影音同步性的 SyncNet [12]、LipFD [13]等 SOTA(State-of-the-art) 模型。儘管這些 SOTA模型分別在 FaceForensics++ [14]（針對影像）或 ASVspoof19 LA [15]（針對音訊）等各自對應的特定資料集上表現優異，但受限於各自關注的偵測維度，在面對不同攻擊手法時往往難以周全應對。目前的檢測技術普遍存在「視覺模型無法察覺聲音偽造」、「音訊模型忽略視覺破綻」，以及「同步性模型可能忽略單一模態品質」的盲點。這使得單獨依賴任一類型的模型，皆難以應對如 FakeAVCeleb [16] 資料集中呈現的複雜偽造情境（如：影像真／聲音真、影像真／聲音假、影像假／聲音真、影音皆假）。
針對上述單一技術在面對複合式攻擊時的侷限性，本計畫預計開發類似 VirusTotal [17] 的「多模態 Deepfake 整合檢測平台」，以現有的 SOTA 模型作為底層偵測引擎基礎，同時部署「影像」、「聲音」及「影音同步性」三維度的檢測模態。此外考量到現有模型多基於英文語料訓練，在中文環境下存在明顯的泛化失效問題，本計畫將自主建置「台灣多模態深偽資料集 FormosaDeepAV」，採集台灣本土新聞與政經訪談素材，針對中文發音模式與口型特徵進行模型微調。
 
本平台將透過平行檢測與特徵融合機制，且將複雜的運算數據轉化為具體的視覺化證據（例如：Grad-Cam、Time Axis）。藉此整合架構與中文語料的優化，本計畫預期在面對含中文內容的複合式深偽攻擊時，能達到 90% 以上的檢測正確率，提供一套即時、量化且透明的檢測方案，驗證整合架構在真實中文場景下的穩健性。
	文獻回顧與探討
本章針對深偽生成與檢測技術進行系統性回顧。3.1 節重點探討本計畫用於建構資料集之關鍵偽造技術，包含語音驅動唇形代表性合成模型 Wav2Lip [6]，以及當前語音合成領域之 SOTA 模型 IndexTTS2 [2]。3.2 節則深入解析對應本研究架構之三種檢測範式：針對影像偽影之 LipsForensics [8]、針對音訊特徵之 AASIST [10]，以及評估影音同步性之 SyncNet [12]。透過分析上述文獻之技術架構，旨在確立本研究多模態整合平台之理論基礎，並探討各模型特徵提取機制與本計畫偵測引擎之關聯性。
	 影像與語音深偽技術
為了建立可控且具代表性的深偽影音資料集，本研究參考目前常見兩大深偽技術，分別為「基於影像之視覺操控」與「基於音訊之語音操控」。以下我們會回顧兩種代表性的深偽技術，分別為基於語音驅動唇形生成Wav2lip和目前語音合成技術 SOTA TTS 模型 IndexTTS2。
3.1.1語音驅動唇形生成Wav2Lip
 
圖 1 Wav2lip 模型架構 [6]
根據 [18] 整理，基於影像偽造技術包含四個主流領域：換臉（Face swapping） [19] [20] [21]、面部重現（Face reenactment） [22] [23] [24]、臉部說話生成（Talking face generation）、臉部屬性編輯（Facial attribute editing） [25] [26] [27]。本計畫專注於影音結合的深偽技術開發，故針對說話臉部生成進行深入探討，並採用該領域代表性模型 Wav2Lip [6] 作為研究基礎。 
Wav2lip 模型架構如圖 1由三個主要模組所構成，分別為一個影像產生器，以及唇形同步專家（Lip-sync Expert）與視覺質量判別器（Visual Quality Discriminator, VQD） [28]兩個判別器（Discriminator）。該影像生成器採用類似於 LipGAN [29]的架構設計，內部由身分編碼器（Identity Encoder）、語音編碼器（Speech Encoder）與臉部解碼器（Face Decoder）三個子模組組成。身分編碼器由堆疊的殘差卷積層構成，負責將隨機選取的參考幀R與在通道軸上串聯的姿勢先驗P（即下半部被遮蔽的目標臉部影像）進行編碼特徵提取。語音編碼器同樣由堆疊的二維卷積層組成，用於編碼輸入的語音片段S，隨後將其生成的語音特徵與臉部特徵表示進行串聯。解碼器則包含卷積層與用於上採樣（Upsampling）的轉置卷積層（Transpose Convolutions），以重建臉部影像。生成器的訓練目標之一為最小化生成幀與真實幀之間的L1重建損失（Reconstruction Loss），其數學形式如下：
	L_{recon}=\frac{1}{N}\sum_{i=1}^{N}\left|\left|L_g-L_G\right|\right|_1\ 	(1)
唇形同步專家模組是一個預訓練且在 Wav2Lip 訓練過程中權重凍結（Frozen）的判別器，其主要意義在於提供準確的唇形同步判別標準，強迫生成器學習正確的唇形運動。該模組是基於 SyncNet [12]進行修改，將輸入格式由原始模型的灰階影像改為彩色影像，並引入殘差跳躍連接（Residual Skip Connections）以加深網路結構。該唇形同步專家判別器藉由計算經 ReLU 激活函數處理後的視訊嵌入向量\ s\ 與語音嵌入向量\ v\ 之間的餘弦相似度（Cosine Similarity），來推導出兩者同步的機率 \ P_{sync}\ 來評估生成影像與語音的匹配程度，其兩向量同步機率 \operatorname{P}_{sync} 與唇形同步損失（Expert Sync Loss）\operatorname{E}_{sync} 定義為：
	P_{sync}=\frac{v\cdot s}{\max{\left(\left|\left|v\right|\right|_2\cdot\left|\left|s\right|\right|_2,\epsilon\right)}}	(2)
	E_{sync}=\frac{1}{N}\sum_{i=1}^{N}-\log{\left(P_{sync}^i\right)}	(3)
為了進一步提升生成影像的逼真度並減少模糊與偽影，模型引入了視覺質量判別器（VQD） [28]，該模組透過生成對抗網路（GAN） [30]的機制進行訓練。VQD 的意義在於針對生成影像的視覺品質進行判別，計算生成器試圖欺騙判別器的對抗損失（Adversarial Loss），其計算方式為：
	L_{gen}=E_{x\sim L_g}\left[\log{\left(1-D\left(x\right)\right)}\right]	(4)
最終整體模型的優化目標是將重建損失、唇形同步損失與對抗損失進行加權組合。依據論文實驗驗證，為了在同步準確率與影像生成品質間取得平衡，同步懲罰權重 \operatorname{s}_w 設定為 0.03，而對抗損失權重{\operatorname{s}}_{w\ }則設定為0.07。總損失函數表示如下：
	L_{total}=\left(1-s_w-s_g\right)\cdot L_{recon}+s_w\cdot E_{sync}+s_g\cdot L_{gen}	(5)
	語音合成技術IndexTTS2
當前能夠做到語音複製（Voice Cloning）語音合成技術分為兩大主流方法：語者自適應（Speaker Adaption） [31] [32] 和語者編碼（Speaker Embedding） [1] [2] [3] [4] [5]，而語者編碼因大型語言模型技術進步透過大量語音記號（Speech tokens）訓練，系統得以在複雜的潛在空間（Latent Space）中穩健的捕捉音色（Timbre）與韻律（Prosody），可以達到只需參考音訊 20 秒左右的音訊無須微調（Fine-tune）就可以複製參考音訊音色。
 
圖 2 IndexTTS2 模型架構 [2]
IndexTTS2 屬於目前 SOTA 的語者編碼TTS（Text to Speech）模型架構如圖 2主要由文字轉語意（Text-to-Semantic, T2S）、語意轉梅爾頻譜（Semantic-to-Mel, S2M）以及聲碼器（Vocoder）三個主要模組所構成。T2S 模塊透過自回歸 Transformer [33]架構負責從文本生成語意記號，S2M 模塊將這些記號透過 Flow Matching 以非自回歸方式轉換為梅爾頻譜圖，最後由 BigVGANv2 [34]聲碼器將頻譜圖轉換為音訊波形。
	深偽檢測技術
	影像偽影檢測LipForensics
影像偽影檢測主要可分為兩大類：第一類僅聚焦於靜態圖像特徵 [35] [36]；第二類則採取時空融合架構 [8] [37]，結合了 CNN 或 ResNet [38] 等圖像特徵提取網路，以及 RNN、Transformer 或 MS-TCN 等時間序列架構。LipForensics [8]即屬於後者，其採用 ResNet-18 提取圖像特徵，並透過 MS-TCN 整合時間資訊，以達成最終的偽造分類。
 
圖 3 LipForensics 模型架構 [8]
LipForensics模型架構如圖5所示，該方法以 25 幀原始影像作為輸入，首先對唇部區域提取預處理，隨後將裁切後的灰階唇部序列送入帶有初始 3D 卷積層的 ResNet-18 網絡進行空間特徵提取。後端將提取器輸出的每一幀 512 維特徵向量送入 MS-TCN 進行時序建模，最終透過池化層與線性轉換層完成分類。訓練過程採預訓練微調（Pre-train, Fine-tune），在預訓練階段，針對大規模唇讀資料集Lipreading In The Wild（LRW）訓練一多分類神經網路{\ f}_{l\ }學習唇語辨識，目的使圖像特徵擷取器對唇部特徵敏感。此網路包含一個時空特徵擷取器、一個時間網路和一個線性分類器，分別由 \theta_g、 \theta_h和 \theta_l參數化。網路參數經隨機初始化後進行聯合優化，以最小化標準交叉熵損失（Cross-Entropy Loss）
	\frac{1}{N_l}\sum_{j=1}^{N_l}{\operatorname{L}_{\mathrm{CE}}\left(f_l\left(x_l^j\right),y_l^j;\theta_g,\theta_h,\theta_l\right)} 	(6)
為了遷移至深偽檢測任務 f_f，保留 \theta_g\ 和 \theta_h，並將分類器替換為由 \theta_f 參數化之二元分類器。凍結圖像特徵擷取器 \theta_g，僅針對時間序列網路\theta_h 進行微調，並對二元分類器進行端對端訓練，以最小化二元交叉熵損失 （Binary Cross-Entropy Loss）：
	\frac{1}{N_f}\sum_{j=1}^{N_f}{\operatorname{L}_{\mathrm{BCE}}\left(f_f\left(x_f^j\right),y_f^j;\theta_h,\theta_f\right)}	(7)
	音訊真偽檢測AASIST
 
圖 4 AASIST 模型架構 [10]
在傳統音訊真偽檢測領域中， 多依賴於人工設計的聲學特徵（如 MFCC 或 LFCC），然而這些特徵往往會遺失原始訊號中的細微相位資訊。AASIST 採取了與傳統頻譜特徵不同的路徑，系統直接接收包含 64,600 個採樣點的原始音訊，並透過由 Sinc-convolution 與六層殘差塊構成的編碼器，從時域波形中直接提取出富含相位與震幅細節的高階特徵。該模型的核心優勢在於引入異構圖結構，將提取出的特徵進一步映射為頻譜與時間子圖節點，並藉由異構堆疊圖注意力層引導時域與頻域間的資訊交互。為了從中過濾出微小的偽造特徵，系統利用最大圖運算的競爭機制篩選關鍵瑕疵，最後經由 Readout 層進行特徵拼接以執行最終判定。
 
	影音同步檢測SyncNet
在多模態深偽檢測體系中，音訊與視覺訊號的時序對齊（Lip-Sync Calibration）是判別影像真偽的核心維度。於真實錄製的語音影片中，唇部肌肉的運動特徵應與聲碼器產生的音訊特徵在時間軸上具備高度相關性。目前多數研究如 PerfectMatch [39]，主要透過跨模態學習（Cross-modal Learning）將音訊與影像分別映射至統一的聯合嵌入空間，並藉由計算兩者間的特徵相關性或時序位移量來判定是否存在偽造痕跡。由於深偽生成模型（如 Wav2Lip）在合成過程中，容易在微秒級別產生唇形與語音特徵的偏差，或是在轉換邊界留下非自然波動，因此透過檢測影音對齊程度，能有效識別出單模態檢測器難以察覺的人為操縱痕跡。
SyncNet 架構核心採用非對稱雙流卷積神經網路（Two-stream ConvNet）將異質的多模態訊號轉換為可度量的特徵向量。視覺流（Visual Stream）輸入連續 5 幀的嘴部灰階影像，經由卷積層提取細微的時空特徵；音訊流（Audio Stream）則將語音轉換為 13x20 的 MFCC 特徵熱圖（Heatmap）作為輸入。這兩個獨立的分支網路最終將影像與音訊分別映射至同一個 256 維的聯合嵌入空間（Joint Embedding Space），將原始訊號轉化為高維度的判別資訊。為了讓網路學會辨識「同步性」，訓練過程引入了對比損失函數（Contrastive Loss），其目標機制是最小化「真實同步樣本」在嵌入空間中的歐幾里德距離，同時最大化「非同步樣本」之間的距離，迫使模型學習唇動與語音之間的內在關聯。檢測時採用滑動窗口（Sliding Window）策略，分析不同時間位移下的距離變化。對於未經篡改的真實影片，距離曲線會在正確的同步點出現顯著的全局最小值（Global Minimum），形成尖銳的波谷。反之若影片是由深偽模型生成，由於唇形生成過程中的微小誤差導致特徵無法精確匹配，計算出的距離曲線將維持在高位，或無法呈現明顯的收斂波谷，系統據此即可判定該影片存在人為操縱或偽造痕跡。
	研究方法及步驟
本計畫擬開發之「多模態 Deepfake 整合檢測平台」，其核心設計理念參考資安領域 VirusTotal [17] 的運作模式，採取「Hash 快取比對」與「多模態平行檢測」架構。系統將針對  FakeAVCeleb 資料集和自建資料集 FormosaDeepAV 所涵蓋的複雜偽造情境，微調對應的檢測模型，並以視覺化且直觀的統計列表呈現結果。
 
圖 5 網頁應用流程圖
 
4.1 網頁應用
本研究之系統開發採用前後端分離架構，前端部分使用 Next.js 進行實作，透過其建立網頁介面，並負責檔案上傳、檢測進度呈現與結果視覺化等使用者操作流程，並且透過其內建路由機制有效與後端API進行溝通。後端部分則以Python函式庫FastAPI 建立 RESTful API，統一處理前端請求、資料驗證與回應封裝，並作為模型推論流程的中介層。深度學習模型採用 PyTorch 進行訓練與推論，將訓練完成的模型封裝成函式，由後端 API 依照請求觸發運算並回傳分析結果。
4.1.1 使用者輸入
為兼顧平台效率與結果可追溯性，當使用者上傳影音檔案後，系統先透過雜湊演算法SHA-256計算檔案雜湊值作為檢測結果之主鍵，並與資料庫進行比對，若該檔案已存在歷史紀錄，則直接調用既有檢測結果快取，避免重複執行複雜的推論計算；若不存在任何紀錄，才進入下一階段多模態並行檢測。
4.1.2 多模態並行檢測
本研究之多模態並行檢測架構，將輸入影音檔案同時送入三個模態：影像偽影檢測（模態 A）、音訊真偽檢測（模態 B）與影音同步性檢測（模態 C）。此設計的核心目的在於利用不同模態資訊的互補性：模態 A 針對影像偽造進行判斷，採用 LipForensics、DefakeHop等方法以捕捉口部／下半臉動態中可能出現的時序不自然、局部偽影與合成痕跡；模態 B 針對音訊真偽進行判斷，採用AASIST等方法針對語音在時頻特徵上可能呈現的生成痕跡與聲學不一致；模態 C 則針對影音同步性進行評估，採用 SyncNet 等方法量化嘴部運動與語音訊號在時間軸上的對齊資訊。為避免單一模態在其不擅長情境下產生誤判，本研究以多模態並行與融合策略形成較穩健的整體判讀框架。
每一模態由一個或多個檢測模型（Models）組成。對於第 m\ 個模態（m\in\left\{A,\ B,\ C\right\}），假設其包含K_m個模型，各模型輸出原始分數{\ x}_{m,\ k}。由於不同模型的輸出尺度與語意可能不一致，本研究先透過一致化映射函數將其轉換為一致語意之「偽造風險分數」，並標準化至，記為s_{m,\ k}，其中數值越大表示越可疑。
	s_{m,\ k}=Norm_{m,\ k}\left(x_{m,\ k}\right),\ s_{m,\ k}\in\left[0,\ 1\right]\ 		(8)
當同一模態配置多個模型時，為避免單一模型誤判造成結論不穩，本研究採模態內加權融合產生該模態之總風險分數\ S_m，並透過實驗獲取最佳權重比例。令模態\ m\ 的權重為\ w_m=\left\{w_{m,\ 1},\ \cdots,\ w_{m,\ K_m}\right\}，並滿足w_{k,\ m}\geq0與\sum_{\ K}^{\ \ }w_{m,\ k}=1，則模態分數定義為：
	S_m=\sum_{k=1\ }^{\ K_m}w_{m,\ k}\cdot s_{m,\ k},\ m\in\left\{A,\ B,\ C\right\}	 (9)
其中 S_A、S_B、S_C\ 分別對應影像、音訊與同步三模態之綜合風險評估。實務上，權重可先採均等設定以降低方法假設，或依模型穩定性、可靠度做保守調整；由於本研究之評語生成階段主要採人工判讀，因此權重不必仰賴額外訓練即可運作。
在得到三個模態分數後，系統可進一步產生整體風險分數\ S_{total}，支援「整體結論」的輸出。令跨模態權重為W=\left\{W_A,\ W_B,\ W_C\right\}，則整體分數可定義為：
	S_{total}=W_AS_A+W_BS_B+W_CS_C	(10)
為提升整體判讀的可解釋性，本研究亦計算各模態對整體風險的加權貢獻度c_m，作為後續「主要可疑來源」與評語焦點判定的依據：
	c_m=W_mS_m,\ m\in\left\{A,\ B,\ C\right\}       r_m=\frac{c_m}{S+\varepsilon}	(11)
其中 r_m 表示模態m\ 在整體判讀中的相對主導程度（\varepsilon\ 為避免分母為零之極小常數）。透過\ \ S_{total\ }\ 與\ \left\{r_A,\ r_B,\ r_C\right\}\ ，系統能在輸出總結時同時提供「整體風險等級」與「主要疑點來源」，使後續的評語生成能夠將多模態分數映射為具有可讀性的診斷描述。
在評語生成方面，本研究設計了一套結構化決策邏輯，旨在將量化之風險分數精確轉譯為使用者易於理解的診斷語句。系統首先以整體風險分數 S_{total\ } 為核心判讀基準，將檢測結果進行等級劃分（如：低風險、中度可疑、高度可疑）。
接著，系統進一步利用三個模態的相對主導程度\ \left\{r_A,\ r_B,\ r_C\right\} 定義評語的描述焦點。該決策邏輯遵循以下準則：當特定模態之貢獻度呈現顯著優勢時，系統將判定該模態為主要疑點來源，並在評語中優先定位該維度所對應的異常特徵（如影像偽影、口型不自然或聲學特徵不一致）；若多個模態貢獻度趨於均勻分佈且皆高於閾值，則評語將綜合描述影音跨模態的協同異常現象，以避免診斷結論的過度簡化。
4.1.3 檢測結果展示
網頁診斷機制方面，系統會取得檢測引擎輸出之各模態分數與跨模態融合結果，並以分層方式呈現。系統提供「診斷分析」、「模態狀態區」與「引擎列表」三個區塊展示檢測資料：「診斷分析」顯示三個模態融合後的整體評分和評語，以便使用者快速獲取診斷結果；「模態狀態區」會依據各模態檢測結果表示真、偽（BONAFIDE / SPOOF），可以得知檔案在哪些模態中被偵測到偽造的可能性；「引擎列表」展示模態更詳細的檢測資料，將列出該模態內各模型的評分、模態總風險分數（S_m）以及視覺化輔助證據。針對影像模態，系統以 Grad-CAM 熱力圖標示模型在判斷時較關注的臉部區域或影格；而對於具有時間序列特性的分析流程，則以時間軸（Time Axis）方式呈現異常發生的時間段。
 
圖 6 多模態 Deepfake 整合檢測平台結果展示介面示意圖。上層「模態狀態區」與「診斷分析」直觀呈現三大模態之風險等級與自動化綜合評語；下層「引擎列表」詳列各偵測模型之原始評分、模態風險總分及細部判斷結果。
 
圖 7 視覺化輔助證據面板示意圖。系統利用Grad-CAM繪製熱力圖（左），視覺化呈現LipForensics模型所偵測到的嘴部語義邏輯異常區域，並輔以文字說明判讀依據（右）。
 
4.2 模型訓練
4.2.1 資料集準備與建置
本研究為確保檢測系統具備應對真實世界複合式偽造情境的能力，採用「公開基準資料集」與「自蒐集資料集」之方法，藉此強化系統對特殊環境（中文語境）的適配度。首先以 FakeAVCeleb 作為訓練與基礎效能評估的公開基準，其資料標註完整涵蓋多模態偽造的四種組合：影音全真、影像真／聲音假、影像假／聲音真、影音全假，對應到本研究「多模態平行檢測」與「跨模態一致性分析」的設計目標。考量公開資料集在中文語境、在地化說話型態與最新生成技術覆蓋不足，因此本研究依循 FakeAVCeleb 的架構標準建置自有資料集 FormosaDeepAV，資料結構在類別定義、標籤欄位與命名規則上與公開基準對齊，避免因資料格式不一致而導致評估偏差。 
建置 FormosaDeepAV 時，首先蒐集中文公開直播影音素材，將來源資料拆分為影片資料與音訊資料，並分別導入代表性偽造生成方法：音訊端則以 IndexTTS2、Fish-Speech 等當前 SOTA 語音合成技術產生音訊偽造樣本。影像端以 Wav2Lip 等類型之語音驅動唇形，透過真實語音樣本和音訊偽造樣本合成產生影像偽造版本，並在生成後針對台灣在地中文的影像口型—語音對應特徵品質進行人工篩選，以提升整體合成樣本的自然度；最後依影像真／假與音訊真／假進行組合配對，與 FakeAVCeleb 同結構的四個象限資料類別。
4.2.2 檢測模型訓練
本研究之模型開發策略優先參考各模態 SOTA 論文之原始配置，並基於其開源專案進行實驗復現，以確保基礎效能達到預期標準。在訓練配置上，本研究將自建之 FormosaDeepAV 作為核心訓練資源，針對不同模型特性採取以下三種策略：
	遷移學習與領域微調：對於 LipForensics 與 SyncNet 等依賴大規模特徵的模型，先採用基於通用資料集（如 VoxCeleb）之預訓練權重，隨後導入 FormosaDeepAV 進行領域微調。此舉旨在保留模型對通用偽造特徵的敏感度，同時透過台灣在地影音數據，強化模型對中文口型變化與特定聲學環境的辨識能力。
	接續訓練：為解決公開資料集與實際應用場景間的領域偏移（Domain Shift）問題，本研究以 FormosaDeepAV 對音訊偵測模型（如 AASIST）進行接續訓練。透過納入中文語境下的語音合成樣本，使模型能更精確地捕捉中文發音特徵中的生成痕跡，顯著提升系統在在地化內容上的偵測穩定度。
	從頭訓練：針對如 DefakeHop 等輕量化或統計特徵導向之模型，本研究直接利用 FormosaDeepAV 與 FakeAVCeleb 進行混合訓練，確保模型自底層特徵提取階段即具備應對複合式偽造情境的能力。
4.3 實驗驗證與效能評估
為本研究為驗證「多模態 Deepfake 整合檢測平台」在複雜現實場景下的魯棒性，針對 FakeAVCeleb 與自建之 FormosaDeepAV 資料集建立了嚴謹的評估流程，目標在於確保系統達成正確判斷率大於 90% 的預期指標。資料整備階段採取訓練集、驗證集與測試集的獨立切分策略，藉此避免模型對特定影片來源產生過度擬合。評估指標以準確率為核心，並搭配 F1-score、ROC 曲線與 AUC 值，全面觀測系統在不同決策閾值下的穩定性與辨識能力，確保在極低誤報率的條件下仍能維持高精度的偵測表現。
為了量化技術架構的優勢，研究中進一步進行兩個消融實驗。其中一項實驗透過比較單一模態與多模態並行架構的效能差異，實證整合影像、音訊與同步性資訊對於應對複合式攻擊的必要性。另一項實驗則對比單純使用FakeAVCeleb訓練與加入 FormosaDeepAV 進行微調後的表現差異，藉此驗證自建資料集強化中文語境深偽檢測的關鍵作用，進而證實本系統能有效克服領域偏移（Domain Shift），在台灣在地中文影音環境下展現更深度的防禦韌性。
 
	預期結果
	建構多模態整合檢測平台：
開發一套網頁端系統，整合影像偽影（LipForensics、DeepfakeHop）、音訊真偽（AASIST、Conformer）及影音同步性（SyncNet、LipFD）三大偵測引擎，使用者僅需上傳檔案即可獲得多角度的平行檢測結果。
	具備 90% 正確率之多模態檢測平台：
能有效應對 FakeAVCeleb 資料集中「影像假／聲音真」、「影像真／聲音假」及「全假」等複雜情境，彌補單一模型偵測死角，提升對 Deepfakes、Wav2Lip 及合成語音的綜合防禦率。
	透過 Hash 快取機制實現高效即時回應：
利用檔案指紋（SHA-256 Hash）比對技術建立資料庫快取，針對重複上傳的檔案可直接調用歷史紀錄，大幅降低伺服器重複運算成本，提供使用者即時的檢測體驗。
	提供具可解釋性的視覺檢測報告：
產出包含「綜合統計儀表板」與「詳細檢測列表」的直觀報告，並輔以 Grad-CAM 熱力圖或時間軸標記等視覺化證據，明確指出偽造區域與不同步片段，協助非技術人員快速判讀風險。
表格 1預期進度表
	七月	八月	九月	十月	十一月	十二月	一月	二月
資料蒐集								
深偽資料生成								
模型訓練								
消融實驗								
Web架設								
撰寫報告								
	需要指導教授指導內容
	特徵提取與訊號處理技術：指導 LipForensics 與 AASIST 的特徵提取整合，並傳授音訊偽造痕跡分析及解決影音同步檢測中時間軸對齊的實作經驗。
	深度偽造領域文獻建議：提供最新的 Deepfake 偵測技術（如針對 Wav2Lip 防禦）及多模態學習相關的關鍵學術文獻。
	研究邏輯與實驗設計檢視：協助檢視實驗流程（如資料集劃分、評估指標選擇）的嚴謹性，並指出研究過程中可能的邏輯謬誤。
	應用場景延伸引導：以本檢測平台為基礎，引導思考其在假訊息查核、媒體資安等領域的更多潛在應用價值。
	學術論文與技術報告撰寫：指導大專學生研究計畫書的撰寫架構、圖表呈現方式及符合學術規範的引用格式。
 
	參考文獻

[1] 	W. Deng, et al., "IndexTTS: An Industrial-Level Controllable and Efficient Zero-Shot Text-To-Speech System," arXiv preprint arXiv:2502.05512, 2025. [Online]. Available: https://arxiv.org/abs/2502.05512.
[2] 	S. Zhou, et al., "IndexTTS2: A Breakthrough in Emotionally Expressive and Duration-Controlled Auto-Regressive Zero-Shot Text-to-Speech," arXiv preprint arXiv:2506.21619, 2025. [Online]. Available: https://arxiv.org/abs/2506.21619.
[3] 	Shijia Liao, et al., "Fish-Speech: Leveraging Large Language Models for Advanced Multilingual Text-to-Speech," arXiv preprint arXiv:2411.01156, 2024. [Online]. Available: https://arxiv.org/abs/2411.01156.
[4] 	Y. Chen, et al., "F5-TTS: A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching," arXiv preprint arXiv:2410.06885, 2024. [Online]. Available: https://arxiv.org/abs/2410.06885.
[5] 	E. Casanova, et al., "XTTS: a Massively Multilingual Zero-Shot Text-to-Speech Model.," Interspeech, pp. 4978-4982, 2024. 
[6] 	K. R. Prajwal, et al., "A Lip Sync Expert Is All You Need for Speech to Lip Generation In the Wild," in ACM International Conference on Multimedia (ACM MM), Seattle, WA, USA, 2020. 
[7] 	R. R. Selvaraju, et al., “Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization,” IEEE International Conference on Computer Vision (ICCV), 2017. 
[8] 	A. Haliassos, et al., "Lips Don't Lie: A Generalisable and Robust Approach To Face Forgery Detection," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), Nashville, TN, USA, 2021. 
[9] 	C. C. J. Kuo, et al., "DeepfakeHop: A Light-Weight Fake Face Detector Based on Successive Subspace Learning," in IEEE International Conference on Image Processing (ICIP), Anchorage, AK, USA, 2021. 
[10] 	J. Jung, et al., "AASIST: Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks," in ICASSP 2022 - 2022 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), Singapore, 2022. 
[11] 	A. Gulati, et al., "Conformer: Convolution-augmented Transformer for Speech Recognition," in Interspeech, Shanghai, China, 2020. 
[12] 	Zisserman, J. S. Chung and A., "Out of Time: Automated Lip Sync in the Wild," in Asian Conference on Computer Vision (ACCV), Taipei, Taiwan, 2016. 
[13] 	M. Chen, et al., "Lip-based Video-Audio Forensic Detection," IEEE/CVF Conf. on Computer Vision and Pattern Recognition (CVPR), 2022. 
[14] 	A. Rössler, et al., "FaceForensics++: Learning to Detect Manipulated Facial Images," IEEE/CVF International Conference on Computer Vision (ICCV), pp. 1-11, 2019. 
[15] 	A. Andreas, et al., "ASVspoof 2019: A large-scale public database of synthesized, converted and replayed speech," Computer Speech & Language, vol. vol. 63, p. 101072, 2020. 
[16] 	S. S. S. Khalid, S. Tariq, M. Kim, and S. S. Woo, "FakeAVCeleb: A Novel Audio-Video Multimodal Deepfake Dataset," arXiv preprint arXiv:2108.05080, 2021. [Online]. Available: https://arxiv.org/abs/2108.05080.
[17] 	"VirusTotal: Analyze suspicious files and URLs," [Online]. Available: https://www.virustotal.com.
[18] 	Pei, Gan, et al., "Deepfake Generation and Detection: A Benchmark and Survey," arXiv preprint arXiv:2403.17881, 2024. [Online]. Available: https://arxiv.org/abs/2403.17881.

[19] 	A. Ancilotto, F. Paissan, and E. Farella, "Ximswap: Many-to-many face swapping for tinyml," ACM Transactions on Embedded Computing Systems (TECS), vol. 22, no. 5, pp. 1-21, 2023. 
[20] 	K. Shiohara, X. Yang, and T. Taketomi, "Blendface: Re-designing identity encoders for face-swapping," in Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pp. 22533-22542, 2023. 
[21] 	C. Xu et al., "Region-aware face swapping," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 7632-7641, 2022. 
[22] 	S. Bounareli et al., "Hyperreenact: One-shot reenactment via jointly learning to refine and retarget faces," in Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), p. 22288–22299, 2023. 
[23] 	G. S. Hsu, C. H. Tsai, and H. Y. Wu, "Dual-generator face reenactment," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 642-650, 2022. 
[24] 	M. R. Koujan et al., "Head2head: Video-based neural head synthesis," in Proceedings of the 15th IEEE International Conference on Automatic Face and Gesture Recognition (FG), pp. 16-23, 2020. 
[25] 	Y. Ma et al., "Dreamtalk: When expressive talking head generation meets diffusion probabilistic models," arXiv preprint arXiv:2312.09767, 2023. [Online]. Available: https://arxiv.org/abs/2312.09767.
[26] 	A. Mir, E. Alonso, and E. Mondragón, "Dit-head: High-resolution talking head synthesis using diffusion transformers," in Proceedings of the 16th International Conference on Agents and Artificial Intelligence (ICAART), pp. 562-569, 2024. 
[27] 	C. Zhang et al., "Dr2: Disentangled recurrent representation learning for data-efficient speech video synthesis," in Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pp. 5865-5875, 2024. 
[28] 	A. Manoj, et al., "VQD: Visual Query Detection In Natural Scenes," in Association for Computational Linguistics, 2019. 
[29] 	K. R. Prajwal, et al., "Learning Individual Speaking Styles for Accurate Lip-to-Speech Synthesis," in IEEE Conf. on Computer Vision and Pattern Recognition (CVPR), Seattle, WA, USA, 2020. 
[30] 	I. J. Goodfellow, et al., "Advances in Neural Information Processing Systems," arXiv preprint arXiv:1406.2661, 2014. [Online]. Available: https://arxiv.org/abs/1406.2661.
[31] 	M. Chen, et al., "AdaSpeech: Adaptive Text to Speech for Custom Voice," in International Conference on Learning Representations (ICLR), 2021. 
[32] 	S. F. Huang, et al., "Meta-TTS: Meta-Learning for Few-Shot Speaker Adaptive Text-to-Speech," in IEEE/ACM Transactions on Audio, Speech, and Language Processing, 2021. 
[33] 	A. Vaswani, et al., "Attention Is All You Need," Advances in Neural Information Processing Systems (NeurIPS), vol. vol.30, pp. 5998-6008, 2017. 
[34] 	e. a. K. Kumar, "BigVGAN: A Universal Neural Vocoder with Large-Scale Training," International Conference on Learning Representations (ICLR), 2023. 
[35] 	F. Chollet, "Xception: Deep learning with depthwise separable convolutions," in Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), pp. 1251-1258, 2017. 
[36] 	D. Afchar et al., "MesoNet: a compact facial video forgery detection network," in Proceedings of the IEEE International Workshop on Information Forensics and Security (WIFS), pp. 1-7, 2018. 
[37] 	Y. Zheng et al., "Exploring temporal coherence for more general video face forgery detection," in Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pp. 15044-15054, 2021. 
[38] 	K. He et al., "Deep residual learning for image recognition," in Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), pp. 770-778, 2016. 
[39] 	S.-W. C. e. al., “Perfect match: Improved cross-modal embeddings for audio-visual synchronisation,” ICASSP, pp. 3965-3969, 2018. 
[40] 	R. R. Selvaraju, et al., "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in IEEE International Conference on Computer Vision (ICCV), Venice, Italy, 2017. 
[41] 	DeepSeek-AI, "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning," arXiv preprint arXiv:2403.17881, 2025. [Online]. Available: https://arxiv.org/abs/2403.17881.
[42] 	G. Hinton, O. Vinyals, and J. Dean, "Distilling the Knowledge in a Neural Network," in NIPS 2014 Deep Learning Workshop, 2014. 
[43] 	A. Yang, et al., "Qwen3 Technical Report," arXiv preprint arXiv:2505.09388, 2025. [Online]. Available: https://arxiv.org/abs/2505.09388.





































表C802
