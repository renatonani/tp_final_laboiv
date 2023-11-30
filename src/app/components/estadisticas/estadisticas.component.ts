import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import {
  TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption, GridComponent
} from 'echarts/components';
import { BarChart, BarSeriesOption, PieChart, PieSeriesOption, LineChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout } from 'echarts/features';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

echarts.use([
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  LabelLayout,
  PieChart,  
  BarChart,
  LineChart,
  GridComponent
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption | BarSeriesOption
>;

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit{

  ingresos: any;

  public chartBarDom : HTMLElement | any;
  public myBarChart : any;
  public optionBar: any;

  public chartBarDom2 : HTMLElement | any;
  public myBarChart2 : any;
  public optionBar2: any;

  public chartBarDom3 : HTMLElement | any;
  public myBarChart3 : any;
  public optionBar3: any;

  public chartPieDom : HTMLElement | any;
  public myPieChart : any;
  public optionPie: any;


  rangoFechas: any;
  rangoFechas2: any;

  constructor(private firestore: FirestoreService){
    this.rangoFechas = [];
    this.rangoFechas2 = [];
  }

  ngOnInit() {
    this.firestore.traerIngresos().subscribe(async (ingresos) => {
      // Para cada ingreso, obtenemos el documento del usuario correspondiente
      for (const ingreso of ingresos) {
        const usuarioDoc = await this.firestore.obtenerDocumentoPorID(ingreso.usuarioID);
        
        // Si se encuentra el documento del usuario, agregamos la información al ingreso
        if (usuarioDoc) {
          ingreso.usuario = usuarioDoc["data"];
          ingreso.tipo = usuarioDoc.tipo;
          console.log(ingreso.usuario)
          console.log(ingreso.tipo)
        }
      }

      this.ingresos = ingresos;
    });
  }
  async ngAfterViewInit() 
  {
    const cantidadTurnosPorEspecialidad = await this.firestore.obtenerCantidadTurnosPorEspecialidad();
    this.chartBarDom = document.getElementById('bar');
    this.myBarChart = echarts.init(this.chartBarDom);
    this.optionBar = {
      xAxis: {
        type: 'category',
        data: cantidadTurnosPorEspecialidad.map(item => item.especialidad),
        name: "Especialidad",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 15,
          lineHeight: 40,
        }
      },
      yAxis: {
        type: 'value',        
        minInterval: 1
      },
      series: [
        {
          data: cantidadTurnosPorEspecialidad.map(item => item.cantidad),
          type: 'bar',
          itemStyle: {
            color: '#09b388', // Puedes cambiar este valor al color que desees
            emphasis: {
              color: '#155746' // Color cuando se enfatiza (por ejemplo, al pasar el mouse)
            }
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    };

    this.optionBar && this.myBarChart.setOption(this.optionBar);
    window.addEventListener('resize', this.myBarChart.resize);

    // Obtén la cantidad de turnos por día
    const cantidadTurnosPorDia = await this.firestore.obtenerCantidadTurnosPorDia();
    const colorPalette = ['#09b388', '#0dbb6c', '#2ecc71', '#48d579', '#64e284'];

    this.chartPieDom = document.getElementById('pie');
    this.myPieChart = echarts.init(this.chartPieDom);
    this.optionPie = {
      title: {
        text: 'Cantidad de turnos por día',  // Nombre del gráfico
        left: 'center',  // Alineación del texto
        textStyle: {
          color: '#333',  // Color del texto
          fontSize: 18,   // Tamaño del texto
          fontWeight: 'bold'  // Peso del texto
        }
      },
      tooltip: {
        trigger: 'item'
      },
      color: colorPalette,
      series: [
        {
          name: 'Cantidad de turnos',
          type: 'pie',
          radius: '50%',
          data: cantidadTurnosPorDia.map(item => ({
            name: item.dia,
            value: item.cantidad
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    this.optionPie && this.myPieChart.setOption(this.optionPie);
    window.addEventListener('resize', this.myPieChart.resize);

    const datosGrafico = await this.firestore.prepararDatosParaGrafico(new Date('2023-11-07'), new Date('2023-12-1'), "pendiente"); // Ajusta las fechas según tu caso
    console.log('Datos para el gráfico:', datosGrafico);
    this.chartBarDom2 = document.getElementById('bar2');
    this.myBarChart2 = echarts.init(this.chartBarDom2);

    this.optionBar2 = {
      xAxis: {
        type: 'category',
        data: datosGrafico.map((dato) => dato.nombre),
      },
      yAxis: {
        type: 'value',        
        minInterval: 1
      },
      series: [{
        data: datosGrafico.map((dato) => dato.cantidad),
        type: 'bar',
        itemStyle: {
          color: '#09b388', // Puedes cambiar este valor al color que desees
          emphasis: {
            color: '#155746' // Color cuando se enfatiza (por ejemplo, al pasar el mouse)
          }
        },
      }],
    };

    this.optionBar2 && this.myBarChart2.setOption(this.optionBar2);
    window.addEventListener('resize', this.myBarChart2.resize);

    const datosGrafico2 = await this.firestore.prepararDatosParaGrafico(new Date('2023-11-07'), new Date('2023-12-1'), "realizado"); // Ajusta las fechas según tu caso
    console.log('Datos para el gráfico:', datosGrafico2);
    this.chartBarDom3 = document.getElementById('bar3');
    this.myBarChart3 = echarts.init(this.chartBarDom3);

    this.optionBar3 = {
      xAxis: {
        type: 'category',
        data: datosGrafico2.map((dato) => dato.nombre),
      },
      yAxis: {
        type: 'value',        
        minInterval: 1
      },
      series: [{
        data: datosGrafico2.map((dato) => dato.cantidad),
        type: 'bar',
        itemStyle: {
          color: '#09b388', // Puedes cambiar este valor al color que desees
          emphasis: {
            color: '#155746' // Color cuando se enfatiza (por ejemplo, al pasar el mouse)
          }
        },
      }],
    };

    this.optionBar3 && this.myBarChart3.setOption(this.optionBar3);
    window.addEventListener('resize', this.myBarChart3.resize);
  }

  buscarDatos(estado: string) {
    if (this.rangoFechas && this.rangoFechas.length === 2) {
      const fechaInicio = this.convertirFormatoFecha(this.rangoFechas[0]);
      const fechaFin = this.convertirFormatoFecha(this.rangoFechas[1]);
  
      if (fechaInicio && fechaFin) {
        console.log('Datos a enviar a actualizarGrafico:', fechaInicio, fechaFin);
        this.actualizarGrafico(fechaInicio, fechaFin, estado);
      } else {
        console.log('Error en la conversión de fechas.');
      }
    } else {
      console.log('Por favor, selecciona un rango de fechas.');
    }
  }
  
  // Función para convertir el formato de fecha
  convertirFormatoFecha(fecha: string): Date | null {
    try {
      // Supongamos que la fecha viene en formato "dd/mm/yyyy"
      const partes = fecha.split('/');
      const fechaConvertida = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
      return fechaConvertida;
    } catch (error) {
      console.error('Error al convertir formato de fecha:', error);
      return null;
    }
  }

  async actualizarGrafico(fechaInicio: Date, fechaFin: Date, estado: string) {
    try {
      console.log('Actualizando gráfico con fechas:', fechaInicio, fechaFin);
  
      // Obtener los datos directamente sin procesamiento adicional
      const datosGrafico = await this.firestore.prepararDatosParaGrafico(
        fechaInicio,
        fechaFin,
        estado
      );
  
      console.log('Datos del gráfico:', datosGrafico);
  
      // Actualizar la opción del gráfico
      this.optionBar2 = {
        xAxis: {
          type: 'category',
          data: datosGrafico.map((dato) => dato.nombre),
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: datosGrafico.map((dato) => dato.cantidad),
          type: 'bar',
        }],
      };
  
      // Actualizar el gráfico
      console.log('Opción del gráfico:', this.optionBar2);
      this.optionBar2 && this.myBarChart2.setOption(this.optionBar2, true);
      window.addEventListener('resize', this.myBarChart2.resize);
    } catch (error) {
      console.error('Error al actualizar el gráfico:', error);
    }
  }     
  
  exportPDF(id: string) {
    let chartElement = document.getElementById(id); // Asegúrate de que este es el id correcto
    let myChart: echarts.ECharts | undefined;
    if (chartElement) {
      myChart = echarts.getInstanceByDom(chartElement);
      if (myChart) {
        let base64 = myChart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff',
        });
        if (base64) {
          let docDefinition = {
            content: [
              {
                image: base64,
                width: 500,
              },
            ],
          };

          pdfMake.createPdf(docDefinition).download('grafico');
        }
      }
    }
  }

  base64ToBlob(base64: string, type: string): Blob {
    const binStr = atob(base64.split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    return new Blob([arr], { type: type });
  }
}
