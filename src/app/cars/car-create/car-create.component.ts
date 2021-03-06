import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators }   from '@angular/forms';
import { CarsService } from '../cars.service';
import { Car } from '../car.model';
import { mimeType } from './mime-type.validator';
import { environment } from 'src/environments/environment';

export enum mode{
  'create',
  'edit'
}

@Component({
  selector: 'app-car-create',
  templateUrl: './car-create.component.html',
  styleUrls: ['./car-create.component.css']
})
export class CarCreateComponent implements OnInit{
  private carId: any;
  private mode: mode = mode.create;
  private carImageId: string = "";
  isLoading: Boolean = false;
  isImageLoading: Boolean = false;
  car: Car = {} as Car;
  form: FormGroup;
  imagePreview:string = '';

  constructor(public carsService:CarsService, public route: ActivatedRoute){
    this.form = new FormGroup({
      model: new FormControl(null,
        { validators: [Validators.required, Validators.minLength(3)]}),
      year: new FormControl(null,
        { validators: [Validators.required, Validators.minLength(4), Validators.maxLength(4)]}),
      image: new FormControl(null,
        {
          validators: [Validators.required],
          asyncValidators:[mimeType]
        })
    });
  }

  onCarCreate(){
    if (this.form.invalid){
      return;
    }
    if (this.mode === mode.create){
      debugger;
      const imagePath = this.form.value.image;
      this.carsService.addCar(
        this.form.value.model,
        this.form.value.year,
        this.carImageId
        );
    } else{
      this.carsService.updateCar(
        this.carId,
        this.form.value.model,
        this.form.value.year,
        this.form.value.image
        );
    }

    this.form.reset();
  }

  ngOnInit(){
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('carId')){
        this.carId = paramMap.get('carId');
        this.mode = mode.edit;
        this.isLoading = true;
        this.carsService.getCarBydId(this.carId)
          .subscribe(data => {
            this.car = {
              id: data._id,
              model: data.model,
              year: data.year,
              imageId: data.imageId,
              createdby: data.createdby
            };

            this.form.setValue({
              model: this.car.model,
              year: this.car.year,
              image: this.car.imageId
            })
            this.imagePreview = `${environment.bucketUrl}${data.imageId}`;
            this.isLoading = false;
          });
      }else{
        this.carId = null;
        this.mode = mode.create;
      }
    });
  }

  onImagePicked(event:Event){
    this.isImageLoading = true;
    const htmlFileElement = (event.target as HTMLInputElement);
    if (htmlFileElement && htmlFileElement.files){
      const file = htmlFileElement.files[0];

      this.form.patchValue({ image: file});
      this.form.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;

        const form = new FormData();
        form.append('file', file);

        this.carsService.uploadFileToS3(form)
          .subscribe({
            next: (data:any) => {
              console.log(data.fileId);
              this.isImageLoading = false;
              if(data && data.fileId){
                this.carImageId = data.fileId;
              }},
            error: error => {
              this.isImageLoading = false;
            }
          });
      };

      reader.readAsDataURL(file);
    }
  }
};
