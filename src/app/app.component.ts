import {
  Component,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Simulator, raceData, race_data_slice } from '../simulator/simulator';
import { Horse } from '../horse/horse';
import { Location, LocationEnum, Track, race_phases } from '../track/track';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import { isPlatformBrowser } from '@angular/common';
import { LoadTracksService } from './service/load-tracks.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { kyotoData } from './service/track_data/kyoto';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import asyncBatch from 'async-batch';
import { DateTime } from "ts-luxon";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatListModule, MatToolbarModule, MatSelectModule, MatButtonModule, RouterOutlet, FormsModule, MatFormFieldModule, MatInputModule, MatCardModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  title = 'stamina-eater';
  simulator: Simulator;
  raceResult: any;
  simulation: Chart | undefined = undefined;
  horse: Horse = {
    motivation: 3,
    character_id: 1,
    chard_id: 1,
    current_running_style: 1,
    distance: 7,
    fans: 0,
    ground: 7,
    guts: 0,
    power: 0,
    speed: 0,
    stamina: 0,
    wiz: 0,
    style: 7,
    skills: [],
  };

  table: any[] = []
  spurt: any[] = []
  iterationResult: raceData[] = [];

  iterations = 50;
  availableLocations: Location[] = [];
  selectedLocation: Location = { internal: LocationEnum.Kyoto, name: "Kyoto" };
  availableTracks: Track[] = [];
  selectedTrack: Track = kyotoData[0];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private trackService: LoadTracksService) {
    this.simulator = new Simulator();
  }

  ngOnInit() {
    this.availableLocations = this.trackService.getSelect();
    this.selectedLocation = this.availableLocations[0];
    this.availableTracks = this.trackService.getLocationData(this.selectedLocation.internal)
    this.selectedTrack = this.availableTracks[0];

    if (isPlatformBrowser(this.platformId)) {
      this.horse = localStorage.getItem("honse") ? JSON.parse(localStorage.getItem("honse")!) : this.horse;
    }
  }

  switchLocation(newLocation: Location) {
    this.selectedLocation = newLocation;
    this.availableTracks = this.trackService.getLocationData(this.selectedLocation.internal)
    this.selectedTrack = this.availableTracks[0];
  }

  selectTrack(track: Track) {
    this.selectedTrack = track;
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
    }
  }

  increase() {
    this.iterations++;
  }

  decrease() {
    this.iterations--;
  }

  validateHorseStats(horse: Horse): Horse {

    if (horse.speed == 0) {
      horse.speed = 1200;
    }
    if (horse.stamina == 0) {
      horse.stamina = 1200;
    }
    if (horse.power == 0) {
      horse.power = 1200;
    }
    if (horse.guts == 0) {
      horse.guts = 1200;
    }
    if (horse.wiz == 0) {
      horse.wiz = 1200;
    }

    return horse;
  }

  async startRace(iter: number = this.iterations) {

    this.horse = this.validateHorseStats(this.horse);
    localStorage.setItem("honse", JSON.stringify(this.horse));

    this.iterationResult = [];

    if (this.selectedTrack == undefined) {
      throw ("no track found");
    }

    if (this.simulation != undefined) {
      this.simulation.destroy();
    }

    const iterations = iter; // Set your number of iterations
    const taskRunner = async (taskIndex: number) => {
      const simulationResult = await this.simulator.run_simulation(this.horse, this.selectedTrack, taskIndex === iterations - 1 ? true : false);
      if (taskIndex === iterations - 1) {
        this.processSimulation(simulationResult);
      }

      this.iterationResult.push(simulationResult);
      return simulationResult; // return the result of each simulation
    };

    try {
      const results = await asyncBatch(
        Array.from({ length: iterations }, (_, i) => i), // Array of task indices
        taskRunner, // The function to run for each task
        25 // Concurrency limit
      );

      console.log(this.iterationResult);
      this.table = this.processTable(this.iterationResult, this.selectedTrack);

      // If needed, you can also access other results here
    } catch (err) {
      console.error("An error occurred during the simulations", err);
    }
  }

  processTable(result: raceData[], track: Track) {
    // Separate the data based on the hp condition
    const maxSpurtData = result.filter(data => data.spurt?.isMaxSpurt == true);
    const notMaxSpurtData = result.filter(data => data.spurt?.isMaxSpurt == false);

    let hpAcessLenght = 0;
    let hpAccess = 0;
    let hpDecessLength = 0;
    let hpDecess = 0;

    const calculateHP = (dataSet: raceData[]) => {

      dataSet.forEach(set => {
        const data = set.spurt;

        if (data != undefined) {
          if (data.isMaxSpurt) {
            hpAccess += data.hpDiff
            hpAcessLenght++;
          } else {
            hpDecess += data.hpDiff
            hpDecessLength++;
          }
        }
      });

      return {
        lacking: Math.abs(hpDecess / hpDecessLength),
        excess: Math.abs(hpAccess / hpAcessLenght),
        perc: 100 / dataSet.length * hpAcessLenght
      };
    };

    // Function to calculate the statistics for a given data set
    const calculateStats = (dataSet: raceData[]) => {
      let totalTime = 0, minTime = Infinity, maxTime = 0;

      dataSet.forEach(set => {
        const data = set.slices[set.slices.length - 1];
        totalTime += data.time;
        minTime = Math.min(minTime, data.time);
        maxTime = Math.max(maxTime, data.time);
      });

      const avgTime = totalTime / dataSet.length;

      let stdDevTime = 0;
      dataSet.forEach(set => {
        const data = set.slices[set.slices.length - 1];
        stdDevTime += Math.pow(data.time - avgTime, 2);
      });

      const formatTime = (time: number) => {

        if (isNaN(time) || time == Infinity || time == 0) {
          return "";
        }

        return DateTime.fromMillis(time).toFormat('mm:ss.uuu');
      };

      let dev = Math.sqrt(stdDevTime / dataSet.length / 1000)

      return {
        realtime: formatTime(avgTime),
        standardDev: isNaN(dev) ? "" : dev.toFixed(3),
        best: formatTime(minTime),
        worst: formatTime(maxTime),
        raceTime: formatTime(avgTime * 1.18)
      };
    };

    // Calculate stats for MaxSpurt and Not Max Spurt
    const hp = calculateHP(result);
    const avgStats = calculateStats(result);
    const maxSpurtStats = calculateStats(maxSpurtData);
    const notMaxSpurtStats = calculateStats(notMaxSpurtData);


    const avg = {
      title: "Average",
      realtime: avgStats.realtime,
      standardDev: avgStats.standardDev,
      best: avgStats.best,
      worst: avgStats.worst,
      raceTime: avgStats.raceTime,
    }

    const maxSpurt = {
      title: "Max Spurt",
      realtime: maxSpurtStats.realtime,
      standardDev: maxSpurtStats.standardDev,
      best: maxSpurtStats.best,
      worst: maxSpurtStats.worst,
      raceTime: maxSpurtStats.raceTime,
    }

    const noSpurt = {
      title: "Not Max Spurt",
      realtime: notMaxSpurtStats.realtime,
      standardDev: notMaxSpurtStats.standardDev,
      best: notMaxSpurtStats.best,
      worst: notMaxSpurtStats.worst,
      raceTime: notMaxSpurtStats.raceTime,
    }

    console.log(hp);

    return [avg, maxSpurt, noSpurt];
  }


  processSimulation(result: raceData) {

    const chartData = this.transformDataForChart(result);

    const backgroundDrawingPlugin = (distanceToTime: any, race: raceData, selectedTrack: Track) => ({
      id: 'backgroundDrawing',
      afterDraw(chart: Chart) {
        const raceResult = race.slices;
        const ctx = chart.ctx;
        const xAxis = chart.scales['x'];
        const chartArea = chart.chartArea;

        const drawArea = (segments: any, color: string, top: boolean) => {
          segments.forEach((segment: any) => {

            if (segment.elevation != undefined) {
              color = segment.elevation > 0 ? "RGBA(255, 255, 0, 0.1)" : "RGBA(0, 255, 0, 0.1)";
            }

            const startTime = distanceToTime(segment.start, raceResult);
            const endTime = distanceToTime(segment.end, raceResult);
            const startX = xAxis.getPixelForValue(startTime);
            const endX = xAxis.getPixelForValue(endTime);
            const width = endX - startX;

            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(startX, top ? chartArea.top : (chartArea.bottom - chartArea.top) / 2 + chartArea.top, width, (chartArea.bottom - chartArea.top) / 2);
            ctx.restore();
          });
        };

        const displaySegement = (segments: race_phases[], color: string) => {
          segments.forEach((segment: race_phases) => {

            if (segment.end == selectedTrack.length)
              return;

            const startTime = distanceToTime(segment.end, raceResult);
            const startX = xAxis.getPixelForValue(startTime);
            const width = 2;

            ctx.save();

            // Draw the initial rectangle
            ctx.fillStyle = color;
            ctx.fillRect(startX, chartArea.top, width, chartArea.bottom - chartArea.top);

            // Style for the text
            const textColor = 'white';
            const fontSize = 11; // Set the desired font size
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center'; // Center the text horizontally
            ctx.textBaseline = 'middle'; // Center the text vertically

            // Text to be displayed
            let text = "Middle Leg";

            if (segment.type == 1) {
              text = "Last Leg"
            } else if (segment.type == 2) {
              text = "Final Spurt"
            }

            // Calculate text width and height (approximate)
            const textWidth = ctx.measureText(text).width;
            const textHeight = fontSize * 1.2; // Approximate height

            // Calculate the position and dimensions for the textbox
            const textBoxPadding = 5; // Padding around the text
            const textBoxWidth = textWidth + textBoxPadding * 2;
            const textBoxHeight = textHeight + textBoxPadding * 2;
            const textBoxX = startX + width / 2 - textBoxWidth / 2;
            const textBoxY = chartArea.bottom - textBoxHeight;

            // Draw the semi-transparent background box for the text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // Almost black with semi-transparency
            ctx.fillRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);

            // Draw the text centered in the textbox
            const textX = startX + width / 2; // Center of the rect
            const textY = chartArea.bottom - textBoxHeight / 2; // Middle of the rect
            ctx.fillStyle = textColor;
            ctx.fillText(text, textX, textY);

            ctx.restore();

          });
        };

        const displayTrigger = (distance: number, name: string, top: boolean, color: string, offset: number) => {

          if (distance == selectedTrack.length)
            return;

          const startTime = distanceToTime(distance, raceResult);
          const startX = xAxis.getPixelForValue(startTime);
          const width = 2;

          ctx.save();

          // Draw the initial rectangle
          ctx.fillStyle = color;
          ctx.fillRect(startX, chartArea.top, width, chartArea.bottom - chartArea.top);

          // Style for the text
          const fontSize = 11; // Set the desired font size
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center'; // Center the text horizontally
          ctx.textBaseline = 'middle'; // Center the text vertically

          // Calculate text width and height (approximate)
          const textWidth = ctx.measureText(name).width;
          const textHeight = fontSize * 1.2; // Approximate height

          // Calculate the position and dimensions for the textbox
          const textBoxPadding = 5; // Padding around the text
          const textBoxWidth = textWidth + textBoxPadding * 2;
          const textBoxHeight = textHeight + textBoxPadding * 2;
          const textBoxX = startX + width / 2 - textBoxWidth / 2;
          const textBoxY = top ? chartArea.top : chartArea.bottom - textBoxHeight;

          // Draw the semi-transparent background box for the text
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // Almost black with semi-transparency
          ctx.fillRect(textBoxX, textBoxY + offset, textBoxWidth, textBoxHeight);

          // Draw the text centered in the textbox
          const textX = startX + width / 2; // Center of the rect
          const textY = top ? chartArea.top + textBoxHeight / 2 : chartArea.bottom - textBoxHeight / 2; // Middle of the rect
          ctx.fillStyle = color;
          ctx.fillText(name, textX, textY + offset);

          ctx.restore();
        };


        drawArea(selectedTrack.slopes, "slope", true); // Example color for slopes
        drawArea(selectedTrack.straights, "RGBA(0, 0, 255, 0.1)", false); // Example color for straights
        drawArea(selectedTrack.corners, "RGBA(255, 0, 255, 0.1)", false); // Example color for corners
        displaySegement(selectedTrack.phases, "#000000");
        displayTrigger(selectedTrack.other.keep.end, "Position Keep End", true, "lime", 0);
        displayTrigger(race.spurtStart, "Final Spurt", false, "red", -25);
      }
    });


    // Register the plugin globally

    // Unregister any existing plugin
    Chart.unregister(backgroundDrawingPlugin(this.distanceToTime, result, this.selectedTrack!));

    Chart.register(backgroundDrawingPlugin(this.distanceToTime, result, this.selectedTrack!));

    let ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.simulation = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        backgroundColor: "#303030",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#ffffffb3"
            }
          }
        },
        elements: {
          point: {
            radius: 0
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: "millisecond",
              displayFormats: {
                "millisecond": "mm:ss.uuu"
              },
              tooltipFormat: "mm:ss.uuu",
            },
            ticks: {
              stepSize: 250,
              color: "#ffffffb3"
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: "#ffffffb3"
            },
            min: 0,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: false,
            min: 15,
            max: 30,
            ticks: {
              color: "#ffffffb3"
            }
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: false,
            ticks: {
              color: "#ffffffb3"
            }
          },
        },
      },
    })
  }

  distanceToTime(distance: number, raceData: race_data_slice[]) {
    // If raceData is empty or distance is not a valid number, return null or an appropriate default value
    if (!raceData || raceData.length === 0 || typeof distance !== 'number') {
      return null; // Or return a default value as per your application logic
    }

    // Assuming raceData is sorted by time
    for (let i = 0; i < raceData.length; i++) {
      if (distance <= raceData[i].position) {
        return raceData[i].time;
      }
    }

    // If the distance is beyond the last point in the race data
    return raceData[raceData.length - 1].time;
  }

  // Sample function to transform data
  transformDataForChart(raceData: raceData) {

    const timeLabels = raceData.slices.map((slice) => slice.time);
    const hpData = raceData.slices.map((slice) => slice.hp);
    const speedData = raceData.slices.map((slice) => slice.speed);
    const positionData = raceData.slices.map((slice) => slice.position);

    return {
      labels: timeLabels,
      datasets: [
        {
          label: 'HP',
          data: hpData,
          borderColor: 'red',
          yAxisID: 'y',
        },
        {
          label: 'Speed',
          data: speedData,
          borderColor: 'blue',
          yAxisID: 'y1',
        },
        {
          label: 'Position',
          data: positionData,
          borderColor: 'green',
          yAxisID: 'y2',
        },
      ],
    };
  }
}
