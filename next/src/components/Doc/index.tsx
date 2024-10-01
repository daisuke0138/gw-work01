import apiClient from "@/lib/apiClient";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import Link from "next/link";
import { Stage, Layer, Rect, Circle, Line, Text, Label } from 'react-konva'
import {
    SquareIcon,
    CircleIcon,
    MinusIcon,
    ArrowRightIcon,
    TypeIcon,
    LayoutPanelLeftIcon,
    ImageIcon,
    Palette,
    EraserIcon,
    Save,
    Send
} from 'lucide-react'
import styles from "./style.module.scss";


export default function DocumentCreator() {
    const [title, setTitle] = useState('')
    const [theme, setTheme] = useState('')
    const [overview, setoverview] = useState('')
    const [results, setresults] = useState('')
    const [selectedTool, setSelectedTool] = useState('')
    const [shapes, setShapes] = useState<any[]>([])
    const [stageSize, setStageSize] = useState({ width: 0, height: 500 })
    const router = useRouter();

    //userデータを取得 
    const [userData, setUserData] = useState({ id: '', username: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login'); // トークンがない場合はログインページにリダイレクト
                return;
            }
            console.log('auth_tokeny', localStorage.getItem('auth_token'));
            try {
                const response = await apiClient.get('/auth/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                setUserData(response.data.user); // レスポンスの構造に合わせて修正
                console.log('user', userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [router]);
    console.log('user', userData);

    // ローカルストレージにドキュメントデータを一時保存
    const handleSave = () => {
        const data = {
            title,
            theme,
            overview,
            results,
            shapes,
        };
        localStorage.setItem('documentData', JSON.stringify(data));
        alert('データを一時保存しました');
    };

    // ローカルストレージのjsonデータを読み込み。画面リロード時にデータを復元
    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('documentData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setTitle(data.title);
            setTheme(data.theme);
            setoverview(data.overview);
            setresults(data.results);
            setShapes(data.shapes);
        }
    };

    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    //APIサーバーに送信するデータを格納
    const senddocData = () => {
        return {
            title,
            theme,
            overview,
            results,
            objects: shapes,
        };
    };

    //APIサーバーにデータを送信
    const handleSend = async () => {
        const data = senddocData();
        try {
            const response = await apiClient.post("/auth/doc", data);
            alert('データがdbに保存されました');
        } catch (error) {
            console.error('Error saving data to database:', error);
            alert('データの保存に失敗しました');
        }
    };

    // 画面サイズの変更を検知してキャンバスのサイズを更新
    useEffect(() => {
        const updateSize = () => {
            setStageSize({ width: window.innerWidth * 0.9 - 48, height: 500 })
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const tools = [
        { name: 'square', icon: SquareIcon, tooltip: '四角' },
        { name: 'circle', icon: CircleIcon, tooltip: '丸' },
        { name: 'line', icon: MinusIcon, tooltip: '直線' },
        { name: 'arrow', icon: ArrowRightIcon, tooltip: '矢印' },
        { name: 'text', icon: TypeIcon, tooltip: 'テキストボックス' },
        { name: 'panel', icon: LayoutPanelLeftIcon, tooltip: '結合' },
        { name: 'image', icon: ImageIcon, tooltip: 'イラスト挿入' },
        { name: 'color', icon: Palette, tooltip: 'colerパレット' },
        { name: 'eraser', icon: EraserIcon, tooltip: '削除' },
    ]

    const handleToolSelect = (toolName: string) => {
        setSelectedTool(toolName)
    }

    const handleStageClick = (e: any) => {
        const pos = e.target.getStage().getPointerPosition()
        let newShape

        switch (selectedTool) {
            case 'square':
                newShape = {
                    type: 'Rect',
                    x: pos.x,
                    y: pos.y,
                    width: 50,
                    height: 50,
                    fill: 'red',
                }
                break
            case 'circle':
                newShape = {
                    type: 'Circle',
                    x: pos.x,
                    y: pos.y,
                    radius: 25,
                    fill: 'blue',
                }
                break
            case 'line':
                newShape = {
                    type: 'Line',
                    points: [pos.x, pos.y, pos.x + 50, pos.y + 50],
                    stroke: 'green',
                    strokeWidth: 2,
                }
                break
            default:
                return
        }

        setShapes([...shapes, newShape])
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.toolButtons}>
                    {tools.map((tool) => (
                        <button
                            key={tool.name}
                            onClick={() => handleToolSelect(tool.name)}
                            className={`${styles.toolButton} ${selectedTool === tool.name ? styles.selected : ''}`}
                            title={tool.tooltip}
                        >
                            <tool.icon className={styles.icon} />
                        </button>
                    ))}
                </div>
                <div className={styles.actionButtons}>
                    <Link className={styles.info} href={`/user`}>My Profへ</Link>
                    <button onClick={handleSave} className={styles.actionButton} title="保存">
                        <Save className={styles.icon} />
                    </button>
                    <button onClick={handleSend} className={styles.actionButton} title="送信">
                        <Send className={styles.icon} />
                    </button>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.formGrid}>
                    <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                    >
                        <option value="" disabled>タイトルを選択してください</option>
                        <option value="23年度成果報告">23年度成果報告</option>
                        <option value="24年度成果報告">24年度成果報告</option>
                        <option value="業務活動報告">業務活動報告</option>
                    </select>
                    <input
                        type="text"
                        placeholder="テーマ"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className={styles.input}
                    />
                    <div className={styles.username}>
                        <Label htmlFor="username">氏名</Label>
                        <p className={styles.p}>{userData.username}
                        </p>
                    </div>
                    <input
                        type="text"
                        placeholder="作成日"
                        value={new Date().toLocaleDateString()}
                        readOnly
                        className={`${styles.input} ${styles.readonly}`}
                    />
                    <textarea
                        placeholder="概要"
                        value={overview}
                        onChange={(e) => setoverview(e.target.value)}
                        className={styles.textarea}
                        rows={2}
                    />
                    <textarea
                        placeholder="成果"
                        value={results}
                        onChange={(e) => setresults(e.target.value)}
                        className={styles.textarea}
                        rows={2}
                    />
                </div>
                <div id="canvas-container" className={styles.canvasContainer}>
                    <Stage  width={stageSize.width} height={stageSize.height} onClick={handleStageClick}>
                        <Layer >
                            {shapes.map((shape, i) => {
                                switch (shape.type) {
                                    case 'Rect':
                                        return <Rect key={i} {...shape} />
                                    case 'Circle':
                                        return <Circle key={i} {...shape} />
                                    case 'Line':
                                        return <Line key={i} {...shape} />
                                    default:
                                        return null
                                }
                            })}
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    )
}
