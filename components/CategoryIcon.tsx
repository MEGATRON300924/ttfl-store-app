import Svg,{Circle,Path,Rect,Polygon} from "react-native-svg";
import { theme } from "@/lib/theme";

export function CategoryIcon({name,size=26}:{name:string;size?:number}){
 const n=name.toLowerCase(); const stroke=theme.colors.ember500;
 if(n.includes("phone")||n.includes("elect")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke={stroke} strokeWidth="1.8"/><Circle cx="12" cy="18.5" r="1" fill={stroke}/></Svg>;
 if(n.includes("fashion")||n.includes("cloth")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M8 5l4 2 4-2 4 4-3 3v9H7v-9L4 9l4-4z" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round"/></Svg>;
 if(n.includes("home")||n.includes("furniture")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M3 11l9-7 9 7v9H3zM8 20v-6h8v6" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/></Svg>;
 if(n.includes("beaut")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M9 3h6M10 3v6l-4 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-9V3" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/><Path d="M8 16h8" stroke={stroke} strokeWidth="1.8"/></Svg>;
 if(n.includes("car")||n.includes("auto")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M5 15l1.5-5h11L19 15v5H5zM3 15h18M7 18h.01M17 18h.01" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
 if(n.includes("food")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 3v7M5 3v7M9 3v7M7 10v11M16 3v18M16 3c3 2 3 5 0 7" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></Svg>;
 if(n.includes("book")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 4a3 3 0 0 1 3-2h13v18H7a3 3 0 0 0-3 3zM4 4v19" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/></Svg>;
 if(n.includes("sport")) return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="9" fill="none" stroke={stroke} strokeWidth="1.8"/><Path d="M7 7l5 3 5-3M7 17l5-3 5 3M12 10v4" fill="none" stroke={stroke} strokeWidth="1.5"/></Svg>;
 return <Svg width={size} height={size} viewBox="0 0 24 24"><Polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round"/></Svg>;
}