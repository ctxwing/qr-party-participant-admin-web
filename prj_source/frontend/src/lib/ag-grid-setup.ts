/**
 * Ag-Grid v35 공통 설정 및 모듈 등록
 * 작성자: ctxwing@gmail.com
 */
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

// CSS 임포트 (전역 설정을 위해 여기서 호출하거나 layout에서 호출 가능)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

// 공통 기본 컬럼 정의
export const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: false,
  suppressMovable: false,
  cellStyle: { display: 'flex', alignItems: 'center' }
};

// 테마 클래스 상수
export const AG_GRID_THEME = "ag-theme-alpine-dark";
