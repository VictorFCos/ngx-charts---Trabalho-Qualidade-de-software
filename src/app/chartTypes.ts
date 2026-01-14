
import { barCharts } from './chart-types/bar-charts.config';
import { pieCharts } from './chart-types/pie-charts.config';
import { lineAreaCharts } from './chart-types/line-area-charts.config';
import { otherCharts } from './chart-types/other-charts.config';
import { demoCharts } from './chart-types/demos.config';

const chartGroups = [
  {
    name: 'Bar Charts',
    charts: barCharts
  },
  {
    name: 'Pie Charts',
    charts: pieCharts
  },
  {
    name: 'Line/Area Charts',
    charts: lineAreaCharts
  },
  {
    name: 'Other Charts',
    charts: otherCharts
  },
  {
    name: 'Demos',
    charts: demoCharts
  }
];

export default chartGroups;
