export type MemberType =
  | 'top_chord'
  | 'bottom_chord'
  | 'king_post'
  | 'hanger_post'
  | 'web_strut'
  | 'web_tie'
  | 'hip_rafter';

export interface Node2D {
  id: number;
  x: number; // meters from left heel
  y: number; // meters above wall plate
  type: string;
}

export interface TimberSection {
  id: string;
  nominalName: string;
  width: number;  // mm (thickness, e.g. 38)
  depth: number;  // mm (width in elevation, e.g. 89, 140, 184)
  area: number;   // mm²
  I_y: number;    // mm⁴
  W_el_y: number; // mm³
}

export interface TimberGrade {
  id: string;
  name: string;
  species: string;
  f_m_k: number;    // Bending strength (MPa)
  f_t_0_k: number;  // Tension parallel (MPa)
  f_c_0_k: number;  // Compression parallel (MPa)
  f_v_k: number;    // Shear strength (MPa)
  f_c_90_k: number; // Compression perpendicular (MPa)
  E_0_mean: number; // Mean Modulus of Elasticity (MPa)
  E_0_05: number;   // 5th percentile Modulus (MPa)
  density: number;  // kg/m³
}

export interface Member2D {
  id: string;
  startNodeId: number;
  endNodeId: number;
  type: MemberType;
  section: TimberSection;
  grade: TimberGrade;
  length: number;          // meters
  axialForce: number;      // kN (+ tension, - compression)
  axialStress: number;     // MPa
  allowableStress: number; // MPa
  slendernessRatio: number;// λ = Le / r
  capacityKN: number;      // Allowable axial capacity in kN
  utilization: number;     // Stress ratio (0.0 to 1.0+)
  status: 'SAFE' | 'WARNING' | 'FAILED';
  governingCheck: 'Tension' | 'Compression' | 'Combined';
  /** Unfactored Dead Load (DL) on this member in kN */
  deadLoadKN?: number;
  /** Unfactored Roof Live / Snow Load (LL) on this member in kN */
  liveLoadKN?: number;
  /** Total Unfactored Roof Load (DL + LL) on this member in kN */
  totalRoofLoadKN?: number;
  /** Distributed Dead Load intensity along horizontal projection (kN/m) */
  deadLineLoadKNm?: number;
  /** Distributed Live/Snow Load intensity along horizontal projection (kN/m) */
  liveLineLoadKNm?: number;
  /** Total Distributed Roof Load intensity (DL + LL) along horizontal projection (kN/m) */
  lineLoadKNm?: number;
  /** Member tributary area in m² (horizontal projection × truss spacing) */
  tributaryAreaM2?: number;
  /** Axial force component due to Dead Load (kN) */
  deadAxialKN?: number;
  /** Axial force component due to Live/Snow Load (kN) */
  liveAxialKN?: number;
}

export interface MemberRoofLoadBreakdown {
  memberId: string;
  memberType: MemberType;
  /** Horizontal span projection of member (m) */
  horizontalProjM: number;
  /** Sloped member length (m) */
  slopedLengthM: number;
  /** Truss spacing / tributary width (m) */
  spacingM: number;
  /** Member tributary area (m²) */
  tributaryAreaM2: number;
  /** Member tributary area (ft²) */
  tributaryAreaFt2: number;
  /** Applied surface Dead Load pressure (kPa) */
  deadPressureKPa: number;
  /** Applied surface Dead Load pressure (psf) */
  deadPressurePsf: number;
  /** Applied surface Live/Snow Load pressure (kPa) */
  livePressureKPa: number;
  /** Applied surface Live/Snow Load pressure (psf) */
  livePressurePsf: number;
  /** Total surface pressure DL + LL (kPa) */
  totalPressureKPa: number;
  /** Total surface pressure DL + LL (psf) */
  totalPressurePsf: number;
  /** Distributed Dead Load line intensity (kN/m) */
  deadLineKNm: number;
  /** Distributed Live Load line intensity (kN/m) */
  liveLineKNm: number;
  /** Total Distributed Load line intensity DL + LL (kN/m) */
  totalLineKNm: number;
  /** Total Distributed Load line intensity DL + LL (plf) */
  totalLinePlf: number;
  /** Total Dead Load force on member (kN) */
  deadLoadKN: number;
  /** Total Dead Load force on member (lbs) */
  deadLoadLbs: number;
  /** Total Live/Snow Load force on member (kN) */
  liveLoadKN: number;
  /** Total Live/Snow Load force on member (lbs) */
  liveLoadLbs: number;
  /** Total Roof Load (DL + LL) on member (kN) */
  totalRoofLoadKN: number;
  /** Total Roof Load (DL + LL) on member (lbs) */
  totalRoofLoadLbs: number;
  /** Axial force from Dead Load (kN) */
  deadAxialKN: number;
  /** Axial force from Live/Snow Load (kN) */
  liveAxialKN: number;
  /** Total Axial force (kN) */
  totalAxialKN: number;
  /** Factored ULS Total Load (1.2 DL + 1.5 LL) in kN */
  factoredTotalLoadKN: number;
  /** Building code reference string */
  codeCombinationRef: string;
  /** Whether design load meets or exceeds IBC 2018 / ASCE 7-16 minimums (DL >= 0.48 kPa / 10 psf, LL >= 0.96 kPa / 20 psf) */
  meetsCodeMinimums: boolean;
  /** Code verification note */
  codeVerificationNote: string;
}

export interface ConnectionPlate {
  id: string;
  nodeId: number;
  widthMm: number;
  lengthMm: number;
  gauge: number;
  capacityUtilization: number;
}

export interface TrussStructure {
  id: string;
  tag: string;             // e.g. "TR-001", "GIRDER-01"
  name: string;
  type: string;            // 'fink', 'howe', 'pratt', 'hip_girder', etc.
  role: 'Common' | 'Girder' | 'Jack' | 'StepDown' | 'HipValleyCarrier';
  span: number;            // clear span in meters
  height: number;          // total height in meters
  pitch: number;           // pitch in degrees
  overhang: number;        // eave overhang in meters
  spacing: number;         // on-center spacing in meters
  baseElevation: number;   // elevation in meters
  /** Applied Roof Dead Load pressure in kPa (default 0.65 kPa / 13.6 psf) */
  deadLoadKPa?: number;
  /** Applied Roof Live / Snow Load pressure in kPa (default 1.20 kPa / 25.1 psf) */
  liveLoadKPa?: number;
  /** Applied Bottom Chord Ceiling Dead Load pressure in kPa (default 0.25 kPa / 5.2 psf) */
  ceilingDeadKPa?: number;
  /** Total Unfactored Dead Load across the entire truss (kN) */
  totalDeadLoadKN?: number;
  /** Total Unfactored Live / Snow Load across the entire truss (kN) */
  totalLiveLoadKN?: number;
  /** Total Unfactored Roof Load (DL + LL) across the entire truss (kN) */
  totalRoofLoadKN?: number;
  nodes: Node2D[];
  members: Member2D[];
  connections?: ConnectionPlate[];
  maxUtilization: number;
  maxDeflection: number;       // mm
  allowableDeflection: number; // mm
  reactionLeft: number;        // kN
  reactionRight: number;       // kN
  upliftLeft?: number;         // kN
  upliftRight?: number;        // kN
  integrityStatus: 'PASS' | 'WARNING' | 'FAIL';
  svgDrawing?: string;
  // --- link to the 3D roof model (set when the truss was read from the 3D framing) ---
  assemblyId?: string;        // 3D assembly id of this truss
  plyIds?: string[];          // every 3D assembly (girder plies) that shares this truss' webs
  overhangRight?: number;     // m (overhang is the left one)
  sourceChordSig?: string;    // signature of the 3D chords this elevation was built from
  sourceWebSig?: string;      // signature of the 3D webs it was built from
  baseWebSig?: string;        // signature of the webs as built (to detect edits made in the elevation)
  publishedWebSig?: string;   // signature of the webs pushed to 3D after an edit in this tab
  unstable?: boolean;         // web layout does not triangulate the truss         // Optional MiTek shop drawing SVG string
}

