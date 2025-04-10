import * as cdk from 'aws-cdk-lib';
import { Ec2InstanceAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // To create a VPC with public and private subnets
    const vpc = new ec2.Vpc(this, 'WebHostingVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // To create an IAM Role for EC2
    const role = new iam.Role(this, 'WebServerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
      ],
    });

    // Security Group for EC2
    const securityGroup = new ec2.SecurityGroup(this, 'WebServerSG', {
      vpc,
      description: 'Allow HTTP and SSH',
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

    // To create an EC2 instance
    const ec2Instance = new ec2.Instance(this, 'WebServerInstance', {
      vpc,
      vpcSubnets: {subnetType:ec2.SubnetType.PUBLIC},
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      role,
      keyName: 'aws-cdk',
    });

    // To attach an EBS Volume
    const volume = new ec2.Volume(this, 'EBSVolume', {
      availabilityZone: ec2Instance.instanceAvailabilityZone,
      size: cdk.Size.gibibytes(1),
      volumeType: ec2.EbsDeviceVolumeType.GP2,
    });

    new cdk.CfnOutput(this, 'EC2PublicIP', {
      value: ec2Instance.instancePublicIp,
      description: 'Public IP of the EC2 instance',
    });
  }
}

